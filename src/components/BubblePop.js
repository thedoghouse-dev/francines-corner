import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Gem definitions ───────────────────────────────────────────────
const GEMS = [
  { id: 0, emoji: '🌸', name: 'Pink',   color: '#F9A8C0', light: '#FDE8EC', ring: '#E75B8D' },
  { id: 1, emoji: '⭐', name: 'Star',   color: '#FCD34D', light: '#FFFBEB', ring: '#CA8A04' },
  { id: 2, emoji: '🍀', name: 'Green',  color: '#6EE7B7', light: '#ECFDF5', ring: '#059669' },
  { id: 3, emoji: '💧', name: 'Blue',   color: '#93C5FD', light: '#EFF6FF', ring: '#2563EB' },
  { id: 4, emoji: '🔮', name: 'Purple', color: '#C4B5FD', light: '#F5F3FF', ring: '#7C3AED' },
  { id: 5, emoji: '🍊', name: 'Orange', color: '#FCA5A5', light: '#FEF2F2', ring: '#DC2626' },
];

const GEM_COUNT = GEMS.length;
const ROWS = 8;
const COLS = 8;

// ── Pure grid helpers ─────────────────────────────────────────────
function rng() { return Math.floor(Math.random() * GEM_COUNT); }

function makeGrid() {
  const g = [];
  for (let r = 0; r < ROWS; r++) {
    g.push([]);
    for (let c = 0; c < COLS; c++) {
      let gem;
      do { gem = rng(); }
      while (
        (c >= 2 && g[r][c-1] === gem && g[r][c-2] === gem) ||
        (r >= 2 && g[r-1][c] === gem && g[r-2][c] === gem)
      );
      g[r].push(gem);
    }
  }
  return g;
}

function findMatches(grid) {
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

  // Horizontal runs of 3+
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS - 2) {
      const t = grid[r][c];
      let end = c + 1;
      while (end < COLS && grid[r][end] === t) end++;
      if (end - c >= 3) for (let x = c; x < end; x++) m[r][x] = true;
      c = end;
    }
  }

  // Vertical runs of 3+
  for (let c = 0; c < COLS; c++) {
    let r = 0;
    while (r < ROWS - 2) {
      const t = grid[r][c];
      let end = r + 1;
      while (end < ROWS && grid[end][c] === t) end++;
      if (end - r >= 3) for (let y = r; y < end; y++) m[y][c] = true;
      r = end;
    }
  }

  return m;
}

function countMatched(m) { return m.flat().filter(Boolean).length; }

function dropAndFill(grid, matched) {
  const next = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let c = 0; c < COLS; c++) {
    const surviving = [];
    for (let r = 0; r < ROWS; r++) if (!matched[r][c]) surviving.push(grid[r][c]);
    const newTiles = Array.from({ length: ROWS - surviving.length }, rng);
    const col = [...newTiles, ...surviving];
    for (let r = 0; r < ROWS; r++) next[r][c] = col[r];
  }
  return next;
}

function findHint(grid) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of [[0,1],[1,0]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= ROWS || nc >= COLS) continue;
        const test = grid.map(row => [...row]);
        [test[r][c], test[nr][nc]] = [test[nr][nc], test[r][c]];
        if (countMatched(findMatches(test)) > 0) return [[r,c],[nr,nc]];
      }
    }
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────
const BubblePop = () => {
  const [grid,       setGrid]       = useState(makeGrid);
  const [selected,   setSelected]   = useState(null);   // [r,c] | null
  const [matched,    setMatched]    = useState(null);   // 2D bool | null
  const [processing, setProcessing] = useState(false);  // for UI (cursor, button disabled)
  const [score,      setScore]      = useState(0);
  const [moves,      setMoves]      = useState(0);
  const [hint,       setHint]       = useState(null);   // [[r1,c1],[r2,c2]] | null

  // processingRef is a synchronous lock — avoids stale-closure reads of processing state
  const processingRef = useRef(false);
  // mountedRef is set true inside the effect so it re-initialises correctly in StrictMode
  const mountedRef    = useRef(false);
  const hintTimerRef  = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Cascade cycle: runs repeatedly until no matches remain ───
  const runCycle = useCallback((g) => {
    if (!mountedRef.current) return;

    const m = findMatches(g);
    const n = countMatched(m);

    if (n === 0) {
      // No more matches — unlock the board
      processingRef.current = false;
      setProcessing(false);
      setMatched(null);
      return;
    }

    // Show matched tiles popping out
    setMatched(m);
    setScore(s => s + n * 10);

    // After pop animation, drop tiles and refill
    setTimeout(() => {
      if (!mountedRef.current) return;
      const next = dropAndFill(g, m);
      setGrid(next);
      setMatched(null);
      // Short pause then check for cascades
      setTimeout(() => runCycle(next), 350);
    }, 550);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tile click handler ───────────────────────────────────────
  const handleClick = (r, c) => {
    if (processingRef.current) return;  // synchronous guard

    // Clear hint
    setHint(null);
    if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }

    if (!selected) { setSelected([r, c]); return; }

    const [sr, sc] = selected;

    if (sr === r && sc === c) { setSelected(null); return; }

    // Non-adjacent → re-select
    if (Math.abs(sr - r) + Math.abs(sc - c) !== 1) { setSelected([r, c]); return; }

    // Attempt swap
    const newGrid = grid.map(row => [...row]);
    [newGrid[sr][sc], newGrid[r][c]] = [newGrid[r][c], newGrid[sr][sc]];
    setSelected(null);

    const m = findMatches(newGrid);
    if (countMatched(m) > 0) {
      setGrid(newGrid);
      setMoves(mv => mv + 1);
      // Lock the board synchronously before any async state update
      processingRef.current = true;
      setProcessing(true);
      runCycle(newGrid);
    } else {
      // Briefly show the swap then revert (invalid move feedback)
      setGrid(newGrid);
      setTimeout(() => {
        if (!mountedRef.current) return;
        const rev = newGrid.map(row => [...row]);
        [rev[sr][sc], rev[r][c]] = [rev[r][c], rev[sr][sc]];
        setGrid(rev);
      }, 280);
    }
  };

  // ── Hint ─────────────────────────────────────────────────────
  const showHint = () => {
    if (processingRef.current) return;
    setHint(null);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    const h = findHint(grid);
    if (h) {
      setHint(h);
      hintTimerRef.current = setTimeout(() => setHint(null), 3000);
    } else {
      // No moves left — new board
      setGrid(makeGrid());
    }
  };

  // ── New game ──────────────────────────────────────────────────
  const newGame = () => {
    setHint(null);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    processingRef.current = false;
    setGrid(makeGrid());
    setSelected(null);
    setMatched(null);
    setProcessing(false);
    setScore(0);
    setMoves(0);
  };

  // ── Helpers for cell state ────────────────────────────────────
  const isSelected = (r, c) => selected?.[0] === r && selected?.[1] === c;
  const isMatched  = (r, c) => matched?.[r][c] === true;
  const isHinted   = (r, c) => hint && ((hint[0][0]===r && hint[0][1]===c) || (hint[1][0]===r && hint[1][1]===c));
  const isNeighbor = (r, c) => selected && !isSelected(r,c) && Math.abs(selected[0]-r)+Math.abs(selected[1]-c)===1;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light">
      <Helmet>
        <title>Bubble Pop - Francine's Corner</title>
        <meta name="description" content="Match 3 or more bubbles to pop them!" />
      </Helmet>

      <style>{`
        @keyframes popOut {
          0%   { transform: scale(1);   opacity: 1; }
          40%  { transform: scale(1.35); opacity: 0.8; }
          100% { transform: scale(0);   opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.1); }
        }
        @keyframes hintPulse {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0px gold; }
          50%       { transform: scale(1.12); box-shadow: 0 0 0 5px gold; }
        }
        @keyframes dropIn {
          from { transform: translateY(-40px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-4px); }
          75%       { transform: translateX(4px); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between max-w-lg mx-auto mb-4">
        <Link
          to="/"
          className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 rounded-xl shadow-lg text-base"
        >
          ← Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark via-lavender-dark to-rose-dark">
          Bubble Pop
        </h1>
        <button
          onClick={newGame}
          className="bg-gradient-to-r from-lavender to-lavender-dark text-white font-semibold py-2 px-4 rounded-xl shadow-lg text-base active:scale-95"
        >
          New Game
        </button>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-center gap-8 mb-3 text-lg text-slate-grey-dark max-w-lg mx-auto">
        <span>Score: <strong className="text-rose-dark text-xl">{score}</strong></span>
        <span>Moves: <strong>{moves}</strong></span>
      </div>

      {/* Instruction */}
      <p className="text-center text-slate-grey text-sm mb-3">
        Tap a bubble, then tap an adjacent one to swap · Match 3 or more to pop!
      </p>

      {/* Game grid */}
      <div
        className="mx-auto rounded-3xl border-4 border-lavender-dark shadow-2xl p-2 sm:p-3"
        style={{
          maxWidth: 440,
          background: 'linear-gradient(135deg, #f3e8ff, #fde8ec, #fff0e6)',
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 4,
        }}
      >
        {grid.map((row, r) =>
          row.map((gemId, c) => {
            const gem  = GEMS[gemId];
            const sel  = isSelected(r, c);
            const mat  = isMatched(r, c);
            const hlt  = isHinted(r, c);
            const nbr  = isNeighbor(r, c);

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className="aspect-square rounded-full flex items-center justify-center focus:outline-none transition-transform duration-150"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${gem.light}, ${gem.color})`,
                  boxShadow: sel
                    ? `0 0 0 3px ${gem.ring}, 0 0 12px ${gem.ring}88, inset 0 2px 4px rgba(255,255,255,0.6)`
                    : hlt
                    ? `0 0 0 3px gold, 0 0 10px gold`
                    : nbr
                    ? `0 0 0 2px ${gem.ring}88, inset 0 2px 4px rgba(255,255,255,0.5)`
                    : `inset 0 2px 4px rgba(255,255,255,0.5), 0 2px 6px rgba(0,0,0,0.12)`,
                  animation: mat
                    ? 'popOut 0.5s ease-out forwards'
                    : sel
                    ? 'pulse 0.9s ease-in-out infinite'
                    : hlt
                    ? 'hintPulse 0.8s ease-in-out infinite'
                    : undefined,
                  transform: sel && !mat ? 'scale(1.1)' : undefined,
                  cursor: processing ? 'default' : 'pointer',
                }}
              >
                <span
                  className="text-xl sm:text-2xl select-none leading-none"
                  style={{ filter: mat ? 'brightness(1.4)' : undefined }}
                >
                  {gem.emoji}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Hint button */}
      <div className="flex justify-center mt-5">
        <button
          onClick={showHint}
          disabled={processing}
          className="bg-gradient-to-r from-peach to-peach-dark text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg active:scale-95 disabled:opacity-50"
        >
          💡 Hint
        </button>
      </div>

      <p className="text-center text-slate-grey text-sm mt-3">
        Stuck? Tap Hint to highlight a move · No moves left? Hint deals a new board
      </p>
    </div>
  );
};

export default BubblePop;
