import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const TILE_SIZE = 90;
const TILE_STEP = TILE_SIZE + 4; // 94px per tile
const DEPTH_X = 3;
const DEPTH_Y = 3;
const PADDING = 15;

// 36 unique tile symbols — first 18 used for Easy, all 36 for Medium/Hard
const TILE_TYPES = [
  { id: 0,  sym: '🌸' }, { id: 1,  sym: '🌺' }, { id: 2,  sym: '🌻' },
  { id: 3,  sym: '🌹' }, { id: 4,  sym: '🌷' }, { id: 5,  sym: '🌼' },
  { id: 6,  sym: '🍀' }, { id: 7,  sym: '🍁' }, { id: 8,  sym: '🍂' },
  { id: 9,  sym: '🌿' }, { id: 10, sym: '🌊' }, { id: 11, sym: '🌙' },
  { id: 12, sym: '☀️' }, { id: 13, sym: '⭐' }, { id: 14, sym: '🌈' },
  { id: 15, sym: '⚡' }, { id: 16, sym: '❤️' }, { id: 17, sym: '💛' },
  { id: 18, sym: '💚' }, { id: 19, sym: '💙' }, { id: 20, sym: '💜' },
  { id: 21, sym: '🎵' }, { id: 22, sym: '💎' }, { id: 23, sym: '🎯' },
  { id: 24, sym: '🍎' }, { id: 25, sym: '🍊' }, { id: 26, sym: '🍋' },
  { id: 27, sym: '🍇' }, { id: 28, sym: '🍓' }, { id: 29, sym: '🍒' },
  { id: 30, sym: '🦋' }, { id: 31, sym: '🐝' }, { id: 32, sym: '🦊' },
  { id: 33, sym: '🐢' }, { id: 34, sym: '🐬' }, { id: 35, sym: '🐦' },
];

// ── Easy layouts: 36 tiles, 3 layers ──────────────────────────────────────
// Wide: 6 cols × 3 rows base  |  Tall: 4 cols × 5 rows base
const LAYOUT_EASY_WIDE = (() => {
  const p = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) p.push({ col: c, row: r, layer: 0 });
  for (let r = 0; r < 3; r++) for (let c = 1; c < 5; c++) p.push({ col: c, row: r, layer: 1 });
  for (let r = 0; r < 3; r++) for (let c = 2; c < 4; c++) p.push({ col: c, row: r, layer: 2 });
  return p; // 18 + 12 + 6 = 36
})();
const LAYOUT_EASY_TALL = (() => {
  const p = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) p.push({ col: c, row: r, layer: 0 });
  for (let r = 0; r < 5; r++) for (let c = 1; c < 3; c++) p.push({ col: c, row: r, layer: 1 });
  for (let r = 1; r < 4; r++) for (let c = 1; c < 3; c++) p.push({ col: c, row: r, layer: 2 });
  return p; // 20 + 10 + 6 = 36
})();

// ── Medium layouts: 72 tiles, 3 layers ────────────────────────────────────
// Wide: 8 cols × 5 rows base  |  Tall: 5 cols × 7 rows base
const LAYOUT_MED_WIDE = (() => {
  const p = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) p.push({ col: c, row: r, layer: 0 });
  for (let r = 0; r < 4; r++) for (let c = 1; c < 7; c++) p.push({ col: c, row: r, layer: 1 });
  for (let r = 1; r < 3; r++) for (let c = 2; c < 6; c++) p.push({ col: c, row: r, layer: 2 });
  return p; // 40 + 24 + 8 = 72
})();
const LAYOUT_MED_TALL = (() => {
  const p = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) p.push({ col: c, row: r, layer: 0 }); // 35
  for (let r = 0; r < 7; r++) for (let c = 1; c < 4; c++) p.push({ col: c, row: r, layer: 1 }); // 21
  for (let r = 2; r < 6; r++) for (let c = 1; c < 5; c++) p.push({ col: c, row: r, layer: 2 }); // 16
  return p; // 35 + 21 + 16 = 72
})();

// ── Hard layouts: 72 tiles, 4 layers ──────────────────────────────────────
// Wide: 8 cols × 4 rows base, with a double-stacked inner core
// Tall: 5 cols × 7 rows base, narrow inner pyramid
const LAYOUT_HARD_WIDE = (() => {
  const p = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) p.push({ col: c, row: r, layer: 0 });
  for (let r = 0; r < 4; r++) for (let c = 1; c < 7; c++) p.push({ col: c, row: r, layer: 1 });
  for (let r = 1; r < 3; r++) for (let c = 2; c < 6; c++) p.push({ col: c, row: r, layer: 2 });
  for (let r = 1; r < 3; r++) for (let c = 2; c < 6; c++) p.push({ col: c, row: r, layer: 3 });
  return p; // 32 + 24 + 8 + 8 = 72
})();
const LAYOUT_HARD_TALL = (() => {
  const p = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) p.push({ col: c, row: r, layer: 0 }); // 35
  for (let r = 1; r < 7; r++) for (let c = 1; c < 4; c++) p.push({ col: c, row: r, layer: 1 }); // 18
  for (let r = 1; r < 6; r++) for (let c = 1; c < 4; c++) p.push({ col: c, row: r, layer: 2 }); // 15
  for (let r = 2; r < 6; r++) for (let c = 2; c < 3; c++) p.push({ col: c, row: r, layer: 3 }); //  4
  return p; // 35 + 18 + 15 + 4 = 72
})();

// ── Board pixel dimensions per layout ─────────────────────────────────────
const BOARD_DIMS = {
  easy: {
    wide: { w: 6 * TILE_STEP + DEPTH_X * 2 + PADDING * 2, h: 3 * TILE_STEP + PADDING * 2 + DEPTH_Y * 2 },
    tall: { w: 4 * TILE_STEP + DEPTH_X * 2 + PADDING * 2, h: 5 * TILE_STEP + PADDING * 2 + DEPTH_Y * 2 },
  },
  medium: {
    wide: { w: 8 * TILE_STEP + DEPTH_X * 2 + PADDING * 2, h: 5 * TILE_STEP + PADDING * 2 + DEPTH_Y * 2 },
    tall: { w: 5 * TILE_STEP + DEPTH_X * 2 + PADDING * 2, h: 7 * TILE_STEP + PADDING * 2 + DEPTH_Y * 2 },
  },
  hard: {
    wide: { w: 8 * TILE_STEP + DEPTH_X * 2 + PADDING * 2, h: 4 * TILE_STEP + PADDING * 2 + DEPTH_Y * 2 },
    tall: { w: 5 * TILE_STEP + DEPTH_X * 2 + PADDING * 2, h: 7 * TILE_STEP + PADDING * 2 + DEPTH_Y * 2 },
  },
};

const LAYOUTS = {
  easy:   { wide: LAYOUT_EASY_WIDE,  tall: LAYOUT_EASY_TALL  },
  medium: { wide: LAYOUT_MED_WIDE,   tall: LAYOUT_MED_TALL   },
  hard:   { wide: LAYOUT_HARD_WIDE,  tall: LAYOUT_HARD_TALL  },
};

function chooseLayout(difficulty) {
  const orientation = window.innerWidth >= 640 ? 'wide' : 'tall';
  return {
    positions: LAYOUTS[difficulty][orientation],
    ...BOARD_DIMS[difficulty][orientation],
  };
}

// ── Pure helpers ───────────────────────────────────────────────────────────

function isTileFree(tileId, tiles) {
  const tile = tiles.find(t => t.id === tileId);
  if (!tile || tile.removed) return false;
  const coveredAbove = tiles.some(t =>
    !t.removed && t.id !== tileId && t.layer > tile.layer &&
    t.col === tile.col && t.row === tile.row
  );
  if (coveredAbove) return false;
  const hasLeft  = tiles.some(t => !t.removed && t.layer === tile.layer && t.col === tile.col - 1 && t.row === tile.row);
  const hasRight = tiles.some(t => !t.removed && t.layer === tile.layer && t.col === tile.col + 1 && t.row === tile.row);
  return !(hasLeft && hasRight);
}

function getFreeTiles(tiles) {
  return tiles.filter(t => !t.removed && isTileFree(t.id, tiles));
}

function hasAvailableMatch(tiles) {
  const free = getFreeTiles(tiles);
  for (let i = 0; i < free.length; i++)
    for (let j = i + 1; j < free.length; j++)
      if (free[i].typeId === free[j].typeId) return true;
  return false;
}

// True if two non-removed tiles share the same (col, row) AND typeId.
// Such tiles can never be matched: the lower is blocked by the upper, yet they
// are each other's only partner — an unwinnable deadlock.
function hasStackingConflict(tiles) {
  const active = tiles.filter(t => !t.removed);
  for (let i = 0; i < active.length; i++)
    for (let j = i + 1; j < active.length; j++)
      if (active[i].col === active[j].col &&
          active[i].row === active[j].row &&
          active[i].typeId === active[j].typeId)
        return true;
  return false;
}

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createTiles(positions) {
  const pairCount = positions.length / 2;
  const subset = TILE_TYPES.slice(0, pairCount);
  let tiles;
  do {
    const types = fisherYates([...subset, ...subset]);
    tiles = positions.map((pos, idx) => ({
      id: idx, col: pos.col, row: pos.row, layer: pos.layer,
      typeId: types[idx].id, sym: types[idx].sym, removed: false,
    }));
  } while (hasStackingConflict(tiles));
  return tiles;
}

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

// Compute board scale using window width (works before the board div renders)
function computeScale(layout) {
  // p-4 = 16px each side on mobile, sm:p-6 = 24px each side on desktop
  const sidePadding = window.innerWidth >= 640 ? 48 : 32;
  const available = window.innerWidth - sidePadding;
  return Math.min(1, available / (layout.w + 32));
}

// ── Component ──────────────────────────────────────────────────────────────

const MahjonggSolitaire = () => {
  const [difficulty, setDifficulty] = useState(null); // null = show selection screen
  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [hintIds, setHintIds] = useState([]);
  const [boardScale, setBoardScale] = useState(1);

  const layoutRef = useRef(null);
  const timerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // Update scale on window resize
  useEffect(() => {
    const updateScale = () => {
      if (layoutRef.current) setBoardScale(computeScale(layoutRef.current));
    };
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
  };

  const stopTimer = () => clearInterval(timerRef.current);

  const initGame = (diff) => {
    const layout = chooseLayout(diff);
    layoutRef.current = layout;
    setBoardScale(computeScale(layout));
    setTiles(createTiles(layout.positions));
    setSelected(null);
    setMoves(0);
    setGameWon(false);
    setIsStuck(false);
    setHintIds([]);
    startTimer();
  };

  const handleSelectDifficulty = (diff) => {
    setDifficulty(diff);
    initGame(diff);
  };

  const handleChangeDifficulty = () => {
    stopTimer();
    setDifficulty(null);
    setTiles([]);
  };

  const handleTileClick = (tileId) => {
    if (!isTileFree(tileId, tiles)) return;
    setHintIds([]);

    if (selected === null) { setSelected(tileId); return; }
    if (selected === tileId) { setSelected(null); return; }

    const selTile = tiles.find(t => t.id === selected);
    const clicked  = tiles.find(t => t.id === tileId);

    if (selTile && clicked && selTile.typeId === clicked.typeId) {
      const newTiles = tiles.map(t =>
        t.id === selected || t.id === tileId ? { ...t, removed: true } : t
      );
      setTiles(newTiles);
      setSelected(null);
      setMoves(m => m + 1);
      if (newTiles.every(t => t.removed)) {
        stopTimer();
        setGameWon(true);
      } else if (!hasAvailableMatch(newTiles)) {
        setIsStuck(true);
      }
    } else {
      setSelected(tileId);
    }
  };

  const handleHint = () => {
    setSelected(null);
    const free = getFreeTiles(tiles);
    for (let i = 0; i < free.length; i++)
      for (let j = i + 1; j < free.length; j++)
        if (free[i].typeId === free[j].typeId) {
          setHintIds([free[i].id, free[j].id]);
          return;
        }
    setIsStuck(true);
  };

  const handleShuffle = () => {
    const remaining = tiles.filter(t => !t.removed);
    if (remaining.length < 2) return;
    let newTiles;
    let attempts = 0;
    do {
      const types = fisherYates(remaining.map(t => ({ typeId: t.typeId, sym: t.sym })));
      newTiles = tiles.map(t => {
        if (t.removed) return t;
        const idx = remaining.findIndex(r => r.id === t.id);
        return { ...t, typeId: types[idx].typeId, sym: types[idx].sym };
      });
      attempts++;
    } while ((!hasAvailableMatch(newTiles) || hasStackingConflict(newTiles)) && attempts < 50);
    // Only apply the shuffle if a valid arrangement was found
    if (hasAvailableMatch(newTiles) && !hasStackingConflict(newTiles)) {
      setTiles(newTiles);
      setSelected(null);
      setHintIds([]);
      setIsStuck(false);
    }
    // If all 50 attempts failed, leave isStuck=true so the modal stays visible
  };

  const remainingCount = tiles.filter(t => !t.removed).length;

  const difficultyLabel = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : '';

  return (
    <>
      <Helmet>
        <title>Mahjongg Solitaire - Tile Matching Game | Francine's Corner</title>
        <meta name="description" content="Match pairs of tiles in this classic Mahjongg Solitaire game. Choose Easy, Medium, or Hard!" />
        <meta property="og:title" content="Mahjongg Solitaire - Tile Matching Game | Francine's Corner" />
        <meta property="og:description" content="Match pairs of tiles in this classic Mahjongg Solitaire game. Choose Easy, Medium, or Hard!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://francinescorner.com/mahjongg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mahjongg Solitaire - Tile Matching Game | Francine's Corner" />
        <meta name="twitter:description" content="Match pairs of tiles in this classic Mahjongg Solitaire game. Choose Easy, Medium, or Hard!" />
      </Helmet>

      <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-spa-teal-light via-warm-cream-light to-lavender-light relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
          <div className="absolute top-10 left-10 text-4xl text-spa-teal">❀</div>
          <div className="absolute top-20 right-10 text-4xl text-lavender">✿</div>
          <div className="absolute bottom-20 left-10 text-4xl text-peach">✿</div>
          <div className="absolute bottom-10 right-10 text-4xl text-rose">❀</div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-spa-teal-dark to-lavender-dark">
            Mahjongg Solitaire
          </h1>
          <Link
            to="/"
            className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg sm:text-xl active:scale-95"
          >
            Home
          </Link>
        </div>

        {/* ── Difficulty Selection Screen ── */}
        {!difficulty && (
          <div className="card-elegant max-w-2xl mx-auto relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-spa-teal-dark to-lavender-dark mb-2">
                Choose Your Challenge
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl text-spa-teal">✿</span>
                <p className="text-xl sm:text-2xl text-slate-grey-dark font-light">Select a difficulty to begin</p>
                <span className="text-2xl text-lavender">✿</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleSelectDifficulty('easy')}
                className="bg-green-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-green-700 mb-2">Easy</h3>
                <p className="text-lg text-green-600 font-semibold">36 tiles • 3 layers</p>
                <p className="text-md text-slate-grey mt-2">A gentle introduction</p>
              </button>
              <button
                onClick={() => handleSelectDifficulty('medium')}
                className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-yellow-700 mb-2">Medium</h3>
                <p className="text-lg text-yellow-600 font-semibold">72 tiles • 3 layers</p>
                <p className="text-md text-slate-grey mt-2">The classic challenge</p>
              </button>
              <button
                onClick={() => handleSelectDifficulty('hard')}
                className="bg-red-50 p-6 rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-red-700 mb-2">Hard</h3>
                <p className="text-lg text-red-600 font-semibold">72 tiles • 4 layers</p>
                <p className="text-md text-slate-grey mt-2">For the brave!</p>
              </button>
            </div>
          </div>
        )}

        {/* ── Active Game ── */}
        {difficulty && (
          <>
            {/* Stats & Controls */}
            <div className="card-elegant mb-4 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-spa-teal-dark">{formatTime(elapsed)}</div>
                    <div className="text-sm text-slate-grey">Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-spa-teal-dark">{moves}</div>
                    <div className="text-sm text-slate-grey">Moves</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-spa-teal-dark">{remainingCount}</div>
                    <div className="text-sm text-slate-grey">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold px-2 py-0.5 rounded-lg text-white ${
                      difficulty === 'easy' ? 'bg-green-500' :
                      difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>{difficultyLabel}</div>
                    <div className="text-sm text-slate-grey">Level</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleHint}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-base sm:text-lg active:scale-95"
                  >
                    Hint
                  </button>
                  <button
                    onClick={handleShuffle}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-2 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-base sm:text-lg active:scale-95"
                  >
                    Shuffle
                  </button>
                  <button
                    onClick={() => initGame(difficulty)}
                    className="bg-gradient-to-r from-spa-teal to-spa-teal-dark text-white font-semibold py-2 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-base sm:text-lg active:scale-95"
                  >
                    New Game
                  </button>
                  <button
                    onClick={handleChangeDifficulty}
                    className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 rounded-xl shadow hover:shadow-md transition-all duration-300 text-base sm:text-lg active:scale-95"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="card-elegant mb-4 p-3 text-center relative z-10">
              <p className="text-lg sm:text-xl text-charcoal">
                Click two matching tiles to remove them — only <span className="font-bold text-spa-teal-dark">free tiles</span> (bright) can be selected
              </p>
            </div>

            {/* Board */}
            <div className="relative z-10">
              <div className="flex justify-center">
                <div
                  className="rounded-2xl shadow-2xl bg-gradient-to-br from-spa-teal/10 to-lavender/10 border-2 border-spa-teal/20 overflow-hidden"
                  style={{
                    width:  ((layoutRef.current?.w ?? 0) + 32) * boardScale + 'px',
                    height: ((layoutRef.current?.h ?? 0) + 32) * boardScale + 'px',
                  }}
                >
                  <div
                    style={{
                      padding: '16px',
                      width:  (layoutRef.current?.w ?? 0) + 32 + 'px',
                      height: (layoutRef.current?.h ?? 0) + 32 + 'px',
                      transform: `scale(${boardScale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <div style={{ position: 'relative', width: (layoutRef.current?.w ?? 0) + 'px', height: (layoutRef.current?.h ?? 0) + 'px' }}>
                      {tiles.map(tile => {
                        if (tile.removed) return null;

                        const free       = isTileFree(tile.id, tiles);
                        const isSelected = selected === tile.id;
                        const isHint     = hintIds.includes(tile.id);

                        const x      = PADDING + tile.col * TILE_STEP + tile.layer * DEPTH_X;
                        const y      = PADDING + tile.row * TILE_STEP - tile.layer * DEPTH_Y;
                        const zIndex = tile.layer * 200 + tile.col + tile.row;

                        let bgClass, borderClass, shadowStyle, filterStyle;
                        if (isSelected) {
                          bgClass = 'bg-gradient-to-br from-gold-leaf-light to-gold-leaf';
                          borderClass = 'border-gold-leaf-dark';
                          shadowStyle = '0 0 0 3px #9B7E1F, 2px 4px 10px rgba(0,0,0,0.4)';
                          filterStyle = 'none';
                        } else if (isHint) {
                          bgClass = 'bg-gradient-to-br from-green-50 to-green-100';
                          borderClass = 'border-green-500';
                          shadowStyle = '0 0 0 3px #22c55e, 2px 4px 10px rgba(0,0,0,0.4)';
                          filterStyle = 'none';
                        } else if (free) {
                          bgClass = 'bg-gradient-to-br from-white to-warm-cream';
                          borderClass = 'border-spa-teal/50 hover:border-spa-teal';
                          shadowStyle = '2px 3px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)';
                          filterStyle = 'none';
                        } else {
                          bgClass = 'bg-white';
                          borderClass = 'border-slate-300';
                          shadowStyle = '1px 2px 4px rgba(0,0,0,0.15)';
                          filterStyle = 'grayscale(1) opacity(0.55)';
                        }

                        return (
                          <button
                            key={tile.id}
                            onClick={() => handleTileClick(tile.id)}
                            disabled={!free}
                            title={free ? `${tile.sym} — click to select` : `${tile.sym} — blocked`}
                            style={{
                              position: 'absolute', left: x + 'px', top: y + 'px',
                              width: TILE_SIZE + 'px', height: TILE_SIZE + 'px',
                              zIndex, fontSize: '52px', lineHeight: '1',
                              boxShadow: shadowStyle, filter: filterStyle,
                            }}
                            className={`
                              rounded-lg flex items-center justify-center select-none
                              transition-all duration-150 ${bgClass} ${borderClass}
                              ${free ? 'border-4 cursor-pointer hover:scale-105 active:scale-95' : 'border cursor-not-allowed'}
                              ${isSelected || isHint ? 'scale-105' : ''}
                            `}
                          >
                            {tile.sym}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
                        All tiles matched in <span className="font-bold text-2xl sm:text-3xl">{moves}</span> moves
                      </p>
                      <p className="text-xl sm:text-2xl mb-6">
                        Time: <span className="font-bold text-2xl sm:text-3xl">{formatTime(elapsed)}</span>
                      </p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <button onClick={() => initGame(difficulty)} className="btn-primary text-lg sm:text-xl">
                          PLAY AGAIN
                        </button>
                        <button onClick={handleChangeDifficulty} className="btn-secondary text-lg sm:text-xl">
                          CHANGE DIFFICULTY
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stuck Modal */}
            {isStuck && !gameWon && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn p-4">
                <div className="card-elegant max-w-lg w-full">
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-300">
                    <p className="text-3xl sm:text-4xl font-bold mb-4 text-orange-800">😔 No More Moves!</p>
                    <p className="text-lg sm:text-xl mb-6 text-orange-700">
                      No matching pairs are available. Shuffle the tiles or start a new game.
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <button
                        onClick={handleShuffle}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow hover:shadow-md transition-all duration-300 text-lg active:scale-95"
                      >
                        SHUFFLE TILES
                      </button>
                      <button onClick={() => initGame(difficulty)} className="btn-primary text-lg">
                        NEW GAME
                      </button>
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

export default MahjonggSolitaire;
