import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Puzzle generation ────────────────────────────────────────────────────────

const BASE = [
  [1,2,3,4,5,6,7,8,9],
  [4,5,6,7,8,9,1,2,3],
  [7,8,9,1,2,3,4,5,6],
  [2,3,4,5,6,7,8,9,1],
  [5,6,7,8,9,1,2,3,4],
  [8,9,1,2,3,4,5,6,7],
  [3,4,5,6,7,8,9,1,2],
  [6,7,8,9,1,2,3,4,5],
  [9,1,2,3,4,5,6,7,8],
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSolution() {
  let g = BASE.map(r => [...r]);

  // Shuffle rows within each band
  for (let b = 0; b < 3; b++) {
    const ord = shuffle([0, 1, 2]);
    const base = b * 3;
    const r0 = [...g[base + ord[0]]];
    const r1 = [...g[base + ord[1]]];
    const r2 = [...g[base + ord[2]]];
    g[base] = r0; g[base + 1] = r1; g[base + 2] = r2;
  }

  // Shuffle columns within each stack
  for (let s = 0; s < 3; s++) {
    const ord = shuffle([0, 1, 2]);
    const base = s * 3;
    for (let r = 0; r < 9; r++) {
      const c0 = g[r][base + ord[0]];
      const c1 = g[r][base + ord[1]];
      const c2 = g[r][base + ord[2]];
      g[r][base] = c0; g[r][base + 1] = c1; g[r][base + 2] = c2;
    }
  }

  // Shuffle bands and stacks
  const bOrd = shuffle([0, 1, 2]);
  g = bOrd.flatMap(b => [g[b * 3], g[b * 3 + 1], g[b * 3 + 2]]);
  const sOrd = shuffle([0, 1, 2]);
  for (let r = 0; r < 9; r++)
    g[r] = sOrd.flatMap(s => [g[r][s * 3], g[r][s * 3 + 1], g[r][s * 3 + 2]]);

  // Remap numbers
  const map = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      g[r][c] = map[g[r][c] - 1];

  return g;
}

const REMOVE = { easy: 35, medium: 46, hard: 54 };

function createPuzzle(difficulty) {
  const solution = generateSolution();
  const puzzle   = solution.map(r => [...r]);
  const given    = Array.from({ length: 9 }, () => Array(9).fill(true));
  const cells    = shuffle(Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]));
  let n = 0;
  for (const [r, c] of cells) {
    if (n >= REMOVE[difficulty]) break;
    puzzle[r][c] = 0;
    given[r][c]  = false;
    n++;
  }
  return { puzzle, solution, given };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function findConflicts(puzzle) {
  const bad = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = puzzle[r][c];
      if (!v) continue;
      for (let c2 = 0; c2 < 9; c2++)
        if (c2 !== c && puzzle[r][c2] === v) { bad.add(`${r}-${c}`); bad.add(`${r}-${c2}`); }
      for (let r2 = 0; r2 < 9; r2++)
        if (r2 !== r && puzzle[r2][c] === v) { bad.add(`${r}-${c}`); bad.add(`${r2}-${c}`); }
      const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
      for (let r2 = br; r2 < br + 3; r2++)
        for (let c2 = bc; c2 < bc + 3; c2++)
          if ((r2 !== r || c2 !== c) && puzzle[r2][c2] === v)
            { bad.add(`${r}-${c}`); bad.add(`${r2}-${c2}`); }
    }
  }
  return bad;
}

function isSolved(puzzle, solution) {
  return puzzle.every((row, r) => row.every((v, c) => v === solution[r][c]));
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Thick borders at box boundaries, thin inside
function cellBorderStyle(r, c) {
  return {
    borderTop:    r % 3 === 0 ? '2px solid #374151' : '1px solid #D1D5DB',
    borderLeft:   c % 3 === 0 ? '2px solid #374151' : '1px solid #D1D5DB',
    borderBottom: r === 8     ? '2px solid #374151' : 'none',
    borderRight:  c === 8     ? '2px solid #374151' : 'none',
  };
}

// ── Component ────────────────────────────────────────────────────────────────

const Sudoku = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [puzzle,    setPuzzle]    = useState([]);
  const [solution,  setSolution]  = useState([]);
  const [given,     setGiven]     = useState([]);
  const [selected,  setSelected]  = useState(null); // [row, col]
  const [conflicts, setConflicts] = useState(new Set());
  const [gameWon,   setGameWon]   = useState(false);
  const [elapsed,   setElapsed]   = useState(0);
  const [moves,     setMoves]     = useState(0);

  const timerRef = useRef(null);
  // Ref snapshot for keyboard handler (avoids stale closures)
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = { puzzle, solution, given, selected, gameWon };
  }, [puzzle, solution, given, selected, gameWon]);

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Game init ──────────────────────────────────────────────────────────────

  const startGame = (diff) => {
    const { puzzle: p, solution: s, given: g } = createPuzzle(diff);
    setDifficulty(diff);
    setPuzzle(p);
    setSolution(s);
    setGiven(g);
    setSelected(null);
    setConflicts(new Set());
    setGameWon(false);
    setMoves(0);
    clearInterval(timerRef.current);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  // ── Number entry (shared by tap and keyboard) ──────────────────────────────

  const commitNumber = (num, basePuzzle, baseSolution, r, c) => {
    const np = basePuzzle.map(row => [...row]);
    np[r][c] = num;
    setPuzzle(np);
    if (num !== 0) setMoves(m => m + 1);
    const nc = findConflicts(np);
    setConflicts(nc);
    if (num && nc.size === 0 && isSolved(np, baseSolution)) {
      clearInterval(timerRef.current);
      setGameWon(true);
    }
  };

  const handleNumber = (num) => {
    if (!selected || gameWon) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    commitNumber(num, puzzle, solution, r, c);
  };

  // ── Hint ──────────────────────────────────────────────────────────────────

  const handleHint = () => {
    if (gameWon) return;
    const empties = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (puzzle[r][c] === 0) empties.push([r, c]);
    if (!empties.length) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    const np = puzzle.map(row => [...row]);
    np[r][c] = solution[r][c];
    const ng = given.map(row => [...row]);
    ng[r][c] = true; // lock the revealed cell
    setGiven(ng);
    setPuzzle(np);
    setSelected([r, c]);
    const nc = findConflicts(np);
    setConflicts(nc);
    if (nc.size === 0 && isSolved(np, solution)) {
      clearInterval(timerRef.current);
      setGameWon(true);
    }
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e) => {
      const { selected: sel, gameWon: won, puzzle: p, solution: s, given: g } = stateRef.current;
      if (!sel || won) return;
      const [r, c] = sel;
      if (e.key >= '1' && e.key <= '9') {
        if (!g[r][c]) { e.preventDefault(); commitNumber(parseInt(e.key), p, s, r, c); }
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        if (!g[r][c]) { e.preventDefault(); commitNumber(0, p, s, r, c); }
      } else if (e.key === 'ArrowUp')    { e.preventDefault(); setSelected([Math.max(0, r-1), c]); }
        else if (e.key === 'ArrowDown')  { e.preventDefault(); setSelected([Math.min(8, r+1), c]); }
        else if (e.key === 'ArrowLeft')  { e.preventDefault(); setSelected([r, Math.max(0, c-1)]); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setSelected([r, Math.min(8, c+1)]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // uses stateRef — no deps needed

  // ── Derived values ────────────────────────────────────────────────────────

  const remaining = puzzle.length ? puzzle.flat().filter(v => v === 0).length : 0;
  const diffLabel = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : '';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Helmet>
        <title>Sudoku - Number Puzzle | Francine's Corner</title>
        <meta name="description" content="Classic Sudoku with Easy, Medium, and Hard difficulty. Fill every row, column, and box with numbers 1–9!" />
        <meta property="og:title" content="Sudoku - Number Puzzle | Francine's Corner" />
        <meta property="og:description" content="Classic Sudoku with Easy, Medium, and Hard difficulty." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://francinescorner.com/sudoku" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sudoku - Number Puzzle | Francine's Corner" />
        <meta name="twitter:description" content="Classic Sudoku with Easy, Medium, and Hard difficulty." />
      </Helmet>

      <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-warm-cream-light to-lavender-light relative">

        {/* Decorative */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
          <div className="absolute top-10 left-10 text-4xl" style={{color:'#3B82F6'}}>❀</div>
          <div className="absolute top-20 right-10 text-4xl text-lavender">✿</div>
          <div className="absolute bottom-20 left-10 text-4xl" style={{color:'#1D4ED8'}}>✿</div>
          <div className="absolute bottom-10 right-10 text-4xl text-rose">❀</div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold"
              style={{background:'linear-gradient(to right,#1D4ED8,#7C3AED)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            Sudoku
          </h1>
          <Link to="/"
            className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg sm:text-xl active:scale-95">
            Home
          </Link>
        </div>

        {/* ── Difficulty Selection ── */}
        {!difficulty && (
          <div className="card-elegant max-w-2xl mx-auto relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-script font-bold mb-2"
                  style={{background:'linear-gradient(to right,#1D4ED8,#7C3AED)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
                Choose Your Challenge
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl" style={{color:'#3B82F6'}}>✿</span>
                <p className="text-xl sm:text-2xl text-slate-grey-dark font-light">Select a difficulty to begin</p>
                <span className="text-2xl text-lavender">✿</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => startGame('easy')}
                className="bg-green-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left">
                <h3 className="text-2xl font-bold text-green-700 mb-2">Easy</h3>
                <p className="text-lg text-green-600 font-semibold">46 numbers given</p>
                <p className="text-md text-slate-grey mt-2">A gentle start</p>
              </button>
              <button onClick={() => startGame('medium')}
                className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left">
                <h3 className="text-2xl font-bold text-yellow-700 mb-2">Medium</h3>
                <p className="text-lg text-yellow-600 font-semibold">35 numbers given</p>
                <p className="text-md text-slate-grey mt-2">The classic challenge</p>
              </button>
              <button onClick={() => startGame('hard')}
                className="bg-red-50 p-6 rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left">
                <h3 className="text-2xl font-bold text-red-700 mb-2">Hard</h3>
                <p className="text-lg text-red-600 font-semibold">27 numbers given</p>
                <p className="text-md text-slate-grey mt-2">For the brave!</p>
              </button>
            </div>
          </div>
        )}

        {/* ── Active Game ── */}
        {difficulty && (
          <>
            {/* Stats & Controls */}
            <div className="card-elegant mb-3 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold" style={{color:'#1D4ED8'}}>{formatTime(elapsed)}</div>
                    <div className="text-sm text-slate-grey">Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold" style={{color:'#1D4ED8'}}>{moves}</div>
                    <div className="text-sm text-slate-grey">Moves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold" style={{color:'#1D4ED8'}}>{remaining}</div>
                    <div className="text-sm text-slate-grey">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold px-2 py-0.5 rounded-lg text-white ${
                      difficulty === 'easy' ? 'bg-green-500' : difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>{diffLabel}</div>
                    <div className="text-sm text-slate-grey">Level</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleHint}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-base sm:text-lg active:scale-95">
                    Hint
                  </button>
                  <button onClick={() => startGame(difficulty)}
                    className="text-white font-semibold py-2 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-base sm:text-lg active:scale-95"
                    style={{background:'linear-gradient(to right,#3B82F6,#1D4ED8)'}}>
                    New Game
                  </button>
                  <button onClick={() => { clearInterval(timerRef.current); setDifficulty(null); }}
                    className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-base sm:text-lg active:scale-95">
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="card-elegant mb-3 p-3 text-center relative z-10">
              <p className="text-lg sm:text-xl text-charcoal">
                Fill every row, column &amp; box with <span className="font-bold" style={{color:'#1D4ED8'}}>1 through 9</span> — tap a cell, then tap a number
              </p>
            </div>

            {/* Grid + Number Pad */}
            <div className="relative z-10 flex flex-col items-center">

              {/* Sudoku Grid */}
              <div className="w-full max-w-md rounded-lg overflow-hidden shadow-xl"
                   style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)' }}>
                {Array.from({ length: 81 }, (_, i) => {
                  const r = Math.floor(i / 9), c = i % 9;
                  const val        = puzzle[r]?.[c] || 0;
                  const isGiven    = given[r]?.[c];
                  const isSelected = selected?.[0] === r && selected?.[1] === c;
                  const isConflict = conflicts.has(`${r}-${c}`);

                  // Background: alternating box shading, then highlights
                  let bg = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0 ? '#FFFFFF' : '#EFF6FF';
                  if (selected) {
                    const [sr, sc] = selected;
                    const sameBox = Math.floor(sr/3) === Math.floor(r/3) && Math.floor(sc/3) === Math.floor(c/3);
                    if (sr === r || sc === c || sameBox) bg = '#DBEAFE';
                    const selVal = puzzle[sr]?.[sc];
                    if (selVal && selVal === val && !isSelected) bg = '#BFDBFE';
                  }
                  if (isConflict) bg = '#FEE2E2';
                  if (isSelected) bg = '#FEF9C3';

                  const textColor  = isConflict ? '#DC2626' : isGiven ? '#111827' : '#2563EB';
                  const fontWeight = isGiven ? '800' : '500';

                  return (
                    <button
                      key={i}
                      onClick={() => setSelected([r, c])}
                      style={{
                        ...cellBorderStyle(r, c),
                        background: bg,
                        color: textColor,
                        fontWeight,
                        aspectRatio: '1 / 1',
                        fontSize: 'clamp(15px, 5vw, 28px)',
                        lineHeight: 1,
                        transition: 'background 0.08s',
                      }}
                      className="flex items-center justify-center focus:outline-none active:opacity-70"
                    >
                      {val || ''}
                    </button>
                  );
                })}
              </div>

              {/* Number Pad */}
              <div className="w-full max-w-md mt-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button
                      key={n}
                      onClick={() => handleNumber(n)}
                      className="bg-white border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 font-bold rounded-xl shadow transition-all duration-150 active:scale-95 active:bg-blue-100"
                      style={{ color: '#1D4ED8', fontSize: 'clamp(22px, 6vw, 34px)', padding: '14px 0' }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleNumber(0)}
                  className="w-full mt-2 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-400 text-slate-600 font-semibold rounded-xl shadow transition-all duration-150 active:scale-95"
                  style={{ fontSize: 'clamp(16px, 4vw, 22px)', padding: '12px 0' }}
                >
                  ✕ Erase
                </button>
              </div>
            </div>

            {/* Win Modal */}
            {gameWon && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn p-4">
                <div className="card-elegant max-w-lg w-full">
                  <div className="gold-box text-center relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute w-3 h-3 bg-gold-leaf rounded-full animate-float"
                          style={{
                            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="relative z-10">
                      <p className="text-4xl sm:text-5xl font-bold mb-4 animate-bounce">🎉 You Won! 🎉</p>
                      <p className="text-xl sm:text-2xl mb-2">
                        Puzzle solved in <span className="font-bold text-2xl sm:text-3xl">{moves}</span> moves
                      </p>
                      <p className="text-xl sm:text-2xl mb-6">
                        Time: <span className="font-bold text-2xl sm:text-3xl">{formatTime(elapsed)}</span>
                      </p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <button onClick={() => startGame(difficulty)} className="btn-primary text-lg sm:text-xl">
                          PLAY AGAIN
                        </button>
                        <button onClick={() => { clearInterval(timerRef.current); setDifficulty(null); }}
                          className="btn-secondary text-lg sm:text-xl">
                          CHANGE DIFFICULTY
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Sudoku;
