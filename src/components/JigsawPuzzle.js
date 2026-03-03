import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Pre-computed so values don't change on re-render
const CONFETTI = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left:     `${(i * 2.1) % 100}%`,
  delay:    `${((i * 0.19) % 3).toFixed(2)}s`,
  duration: `${(2.8 + (i * 0.23) % 1.8).toFixed(2)}s`,
  color:    ['#F9A8C0','#D8B4FE','#FFD4B8','#4ade80','#60a5fa','#fbbf24','#f87171','#a78bfa','#34d399','#fb923c'][i % 10],
  size:     `${8 + (i % 6) * 2}px`,
  round:    i % 3 !== 0,
}));

const IMAGE_CATEGORIES = [
  {
    label: 'Dogs',
    emoji: '🐶',
    images: [
      { src: '/images/jigsaw/dogs/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/dogs/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/dogs/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/dogs/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/dogs/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/dogs/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: 'Gardens',
    emoji: '🌷',
    images: [
      { src: '/images/jigsaw/gardens/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/gardens/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/gardens/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/gardens/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/gardens/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/gardens/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: 'Art',
    emoji: '🎨',
    images: [
      { src: '/images/jigsaw/art/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/art/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/art/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/art/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/art/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/art/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: '1960s',
    emoji: '🕰️',
    images: [
      { src: '/images/jigsaw/1960s/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/1960s/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/1960s/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/1960s/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/1960s/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/1960s/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: '1970s',
    emoji: '✌️',
    images: [
      { src: '/images/jigsaw/1970s/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/1970s/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/1970s/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/1970s/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/1970s/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/1970s/photo-6.jpg', label: 'Photo 6' },
    ],
  },
];

// Flat list used internally — kept for backwards compat with any default reference
const PUZZLE_IMAGES = IMAGE_CATEGORIES.flatMap(c => c.images);

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   grid: 3, description: '3×3 · 9 pieces' },
  { value: 'medium', label: 'Medium', grid: 4, description: '4×4 · 16 pieces' },
  { value: 'hard',   label: 'Hard',   grid: 5, description: '5×5 · 25 pieces' },
];

// Board piece size (px) and tray piece size per grid size
const PIECE_SIZES      = { 3: 110, 4: 85, 5: 68 };
const TRAY_PIECE_SIZES = { 3: 76,  4: 64, 5: 52 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns inline style that shows a piece's slice of the image
function pieceStyle(pieceId, gridSize, imageSrc, size) {
  const [row, col] = pieceId.split('-').map(Number);
  const bgX = gridSize <= 1 ? 0 : (col * 100) / (gridSize - 1);
  const bgY = gridSize <= 1 ? 0 : (row * 100) / (gridSize - 1);
  return {
    backgroundImage: `url('${imageSrc}')`,
    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
    backgroundPosition: `${bgX}% ${bgY}%`,
    width: size,
    height: size,
    flexShrink: 0,
  };
}

const JigsawPuzzle = () => {
  // ── screens: 'setup' | 'game' | 'win'
  const [screen, setScreen] = useState('setup');

  // ── setup choices
  const [activeCategory,   setActiveCategory]   = useState(0);
  const [chosenImage,      setChosenImage]       = useState(PUZZLE_IMAGES[0]);
  const [chosenDifficulty, setChosenDifficulty]  = useState('easy');

  // ── active game state
  const [gameImage, setGameImage] = useState(PUZZLE_IMAGES[0]);
  const [gridSize,  setGridSize]  = useState(3);
  const [board,     setBoard]     = useState({});   // { slotKey: pieceId }
  const [tray,      setTray]      = useState([]);   // [pieceId, …]
  // selected: null | { id, from: 'tray'|'board', slotKey? }
  const [selected,  setSelected]  = useState(null);
  const [moves,     setMoves]     = useState(0);

  const totalPieces  = gridSize * gridSize;
  const correctCount = Object.entries(board).filter(([slot, piece]) => slot === piece).length;
  const pieceSize    = PIECE_SIZES[gridSize]      || 90;
  const traySize     = TRAY_PIECE_SIZES[gridSize] || 64;

  // ── Win detection
  useEffect(() => {
    if (
      screen === 'game' &&
      Object.keys(board).length === totalPieces &&
      correctCount === totalPieces
    ) {
      const t = setTimeout(() => setScreen('win'), 700);
      return () => clearTimeout(t);
    }
  }, [board, correctCount, totalPieces, screen]);

  // ── Start / restart game
  const startGame = () => {
    const gs = DIFFICULTIES.find(d => d.value === chosenDifficulty).grid;
    const pieces = [];
    for (let r = 0; r < gs; r++)
      for (let c = 0; c < gs; c++)
        pieces.push(`${r}-${c}`);
    setGameImage(chosenImage);
    setGridSize(gs);
    setBoard({});
    setTray(shuffle(pieces));
    setSelected(null);
    setMoves(0);
    setScreen('game');
  };

  // ── Click handler for a board slot
  const handleBoardSlotClick = (slotKey) => {
    const occupant = board[slotKey];

    if (!selected) {
      // Nothing selected — pick up the occupant (if any)
      if (occupant) setSelected({ id: occupant, from: 'board', slotKey });
      return;
    }

    const { id: pieceId, from, slotKey: fromSlot } = selected;

    // Tapping the same slot that's already selected → deselect
    if (from === 'board' && fromSlot === slotKey) {
      setSelected(null);
      return;
    }

    const newBoard = { ...board };
    let   newTray  = [...tray];

    if (from === 'tray') {
      newTray = newTray.filter(p => p !== pieceId);
      newBoard[slotKey] = pieceId;
      if (occupant) newTray = [...newTray, occupant];   // bumped piece back to tray
    } else {
      // board → board
      newBoard[slotKey] = pieceId;
      if (occupant) {
        newBoard[fromSlot] = occupant;    // swap
      } else {
        delete newBoard[fromSlot];
      }
    }

    setBoard(newBoard);
    setTray(newTray);
    setSelected(null);
    setMoves(m => m + 1);
  };

  // ── Click handler for a tray piece
  const handleTrayClick = (pieceId) => {
    // Tap selected tray piece again → deselect
    if (selected?.id === pieceId && selected.from === 'tray') {
      setSelected(null);
      return;
    }

    // If a board piece is selected, swap it with this tray piece
    if (selected?.from === 'board') {
      const { id: boardPiece, slotKey } = selected;
      setBoard({ ...board, [slotKey]: pieceId });
      setTray(tray.filter(p => p !== pieceId).concat(boardPiece));
      setSelected(null);
      setMoves(m => m + 1);
      return;
    }

    // Select (or change selection to) this tray piece
    setSelected({ id: pieceId, from: 'tray' });
  };

  // ════════════════════════════════════════════════
  // SETUP SCREEN
  // ════════════════════════════════════════════════
  if (screen === 'setup') {
    return (
      <div className="min-h-screen p-6 sm:p-12 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light flex flex-col items-center">
        <Helmet>
          <title>Jigsaw Puzzle - Francine's App</title>
          <meta name="description" content="Jigsaw puzzle game with schnauzer photos" />
        </Helmet>

        <header className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark via-lavender-dark to-rose-dark mb-3">
            Jigsaw Puzzle
          </h1>
          <p className="text-xl text-slate-grey">Choose a photo and difficulty, then start!</p>
        </header>

        {/* Photo selector with category tabs */}
        <section className="mb-10 w-full max-w-xl">
          <h2 className="text-2xl font-display font-semibold text-charcoal text-center mb-5">
            Choose a Photo
          </h2>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {IMAGE_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveCategory(idx);
                  setChosenImage(cat.images[0]);
                }}
                className={`px-4 py-2 rounded-full text-base font-semibold transition-all duration-200 border-2 focus:outline-none
                  ${activeCategory === idx
                    ? 'bg-rose-dark text-white border-rose-dark shadow-md scale-105'
                    : 'bg-white text-charcoal border-warm-cream-dark hover:border-rose hover:scale-105'
                  }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Images for active category */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {IMAGE_CATEGORIES[activeCategory].images.map((img) => (
              <button
                key={img.src}
                onClick={() => setChosenImage(img)}
                className={`rounded-2xl overflow-hidden border-4 transition-all duration-200 shadow-md focus:outline-none
                  ${chosenImage.src === img.src
                    ? 'border-rose-dark shadow-xl scale-105'
                    : 'border-white hover:border-lavender hover:scale-105'
                  }`}
              >
                <img src={img.src} alt={img.label} className="w-full aspect-square object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty selector */}
        <section className="mb-10">
          <h2 className="text-2xl font-display font-semibold text-charcoal text-center mb-5">
            Difficulty
          </h2>
          <div className="flex gap-3 sm:gap-5">
            {DIFFICULTIES.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => setChosenDifficulty(value)}
                className={`py-4 px-5 sm:px-7 rounded-2xl text-center transition-all duration-200 border-4 shadow-md focus:outline-none
                  ${chosenDifficulty === value
                    ? 'bg-gradient-to-br from-lavender to-lavender-dark text-white border-lavender-dark scale-105 shadow-xl'
                    : 'bg-white text-charcoal border-warm-cream-dark hover:border-lavender hover:scale-105'
                  }`}
              >
                <div className="text-2xl font-bold mb-1">{label}</div>
                <div className="text-sm opacity-80">{description}</div>
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={startGame}
          className="bg-gradient-to-r from-rose to-rose-dark text-white font-bold py-5 px-16 rounded-2xl text-2xl shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95"
        >
          Start Puzzle ✿
        </button>

        <Link
          to="/"
          className="mt-8 text-slate-grey hover:text-rose-dark underline decoration-dotted transition-colors text-lg"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // WIN SCREEN
  // ════════════════════════════════════════════════
  if (screen === 'win') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light text-center relative overflow-hidden p-6">
        <Helmet>
          <title>Puzzle Complete! - Francine's App</title>
        </Helmet>

        <style>{`
          @keyframes confettiFall {
            0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1;   }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0.2; }
          }
          @keyframes popIn {
            0%   { transform: scale(0.4); opacity: 0; }
            70%  { transform: scale(1.06); opacity: 1; }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>

        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {CONFETTI.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.left,
                top: '-20px',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.round ? '50%' : '2px',
                animation: `confettiFall ${p.duration} ${p.delay} linear infinite`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark to-lavender-dark mb-2">
            You did it! 🎉
          </h1>
          <p className="text-xl text-slate-grey mb-6">
            Completed in <strong>{moves}</strong> moves
          </p>

          <img
            src={gameImage.src}
            alt="Completed puzzle"
            className="rounded-3xl shadow-2xl border-8 border-white mb-8"
            style={{
              maxWidth: 400,
              width: '90%',
              animation: 'popIn 0.7s ease-out forwards',
            }}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setScreen('setup')}
              className="bg-gradient-to-r from-rose to-rose-dark text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              Play Again
            </button>
            <Link
              to="/"
              className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-xl text-center"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // GAME SCREEN
  // ════════════════════════════════════════════════
  const hasSelection = selected !== null;
  const isFromTray   = selected?.from === 'tray';

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light">
      <Helmet>
        <title>Jigsaw Puzzle - Francine's App</title>
      </Helmet>

      {/* Header row: Home button left, title centre, stats right */}
      <div className="flex items-center justify-between max-w-5xl mx-auto mb-4">
        <Link
          to="/"
          className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-5 rounded-xl shadow-lg text-base"
        >
          ← Home
        </Link>

        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark via-lavender-dark to-rose-dark">
            Jigsaw Puzzle
          </h1>
          <div className="flex items-center justify-center gap-6 text-base text-slate-grey-dark mt-1">
            <span>Moves: <strong>{moves}</strong></span>
            <span>
              Correct:{' '}
              <strong className={correctCount === totalPieces ? 'text-green-600' : ''}>
                {correctCount}/{totalPieces}
              </strong>
            </span>
          </div>
        </div>

        {/* Spacer to keep title centred */}
        <div className="w-24 sm:w-28" />
      </div>

      {/* Reference photo */}
      <div className="flex flex-col items-center mb-4">
        <p className="text-slate-grey font-semibold text-sm mb-2">Reference Photo</p>
        <img
          src={gameImage.src}
          alt="Reference"
          className="rounded-2xl shadow-lg border-4 border-peach-dark"
          style={{ width: Math.min(160, gridSize * pieceSize * 0.43), height: 'auto' }}
        />
      </div>

      {/* Hint bar */}
      <p className="text-center text-base text-slate-grey mb-4 min-h-6">
        {hasSelection
          ? isFromTray
            ? '✦ Piece selected — tap a board slot to place it'
            : '✦ Piece lifted — tap another slot to move it'
          : 'Tap a piece from the tray below, then tap a board slot to place it'}
      </p>

      {/* Puzzle board */}
      <div className="flex flex-col items-center overflow-x-auto max-w-5xl mx-auto">
        <div
          className="rounded-2xl border-4 border-lavender-dark shadow-2xl bg-warm-cream-dark"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridSize}, ${pieceSize}px)`,
            gap: 2,
            padding: 2,
          }}
        >
          {Array.from({ length: gridSize }, (_, row) =>
            Array.from({ length: gridSize }, (_, col) => {
              const slotKey  = `${row}-${col}`;
              const occupant = board[slotKey];
              const isCorrect      = occupant === slotKey;
              const isSelectedHere = selected?.from === 'board' && selected?.slotKey === slotKey;
              const isTargetSlot   = hasSelection && !occupant;
              const boardFull      = tray.length === 0;
              const isWrong        = boardFull && occupant && !isCorrect;

              return (
                <div
                  key={slotKey}
                  onClick={() => handleBoardSlotClick(slotKey)}
                  className={`relative cursor-pointer overflow-hidden transition-all duration-150
                    ${!occupant
                      ? `border-2 border-dashed ${isTargetSlot ? 'border-rose bg-rose-light/40' : 'border-lavender/50 bg-lavender-light/20'}`
                      : ''}
                    ${isCorrect && !isSelectedHere ? 'ring-2 ring-inset ring-green-400' : ''}
                    ${isWrong  && !isSelectedHere ? 'ring-2 ring-inset ring-amber-400' : ''}
                    ${isSelectedHere ? 'opacity-40 ring-2 ring-inset ring-rose-dark' : ''}
                  `}
                  style={{ width: pieceSize, height: pieceSize }}
                >
                  {occupant && (
                    <div
                      style={pieceStyle(occupant, gridSize, gameImage.src, pieceSize)}
                      className="w-full h-full"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Piece tray — directly under the board */}
      <div className="max-w-5xl mx-auto mt-4">
        <p className="text-slate-grey font-semibold mb-2 text-center">
          Piece Tray — {tray.length} remaining
        </p>
        <div className="bg-white/60 backdrop-blur rounded-2xl border-2 border-lavender p-3 shadow-inner min-h-20 flex flex-wrap gap-2 justify-center">
          {tray.length === 0 ? (
            correctCount === totalPieces ? (
              <p className="text-slate-grey italic self-center py-4">All pieces are on the board!</p>
            ) : (
              <p className="text-amber-600 font-semibold self-center py-4 text-center">
                Almost! {totalPieces - correctCount} {totalPieces - correctCount === 1 ? 'piece is' : 'pieces are'} in the wrong spot — look for the orange glow.
              </p>
            )
          ) : (
            tray.map(id => {
              const isSelected = selected?.id === id && selected?.from === 'tray';
              return (
                <div
                  key={id}
                  onClick={() => handleTrayClick(id)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-150
                    ${isSelected
                      ? 'border-rose-dark ring-4 ring-rose ring-offset-1 scale-110 shadow-xl z-10 relative'
                      : 'border-lavender hover:border-lavender-dark hover:scale-105'
                    }`}
                  style={pieceStyle(id, gridSize, gameImage.src, traySize)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-lavender to-lavender-dark text-white font-semibold py-3 px-7 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg active:scale-95"
        >
          Restart
        </button>
        <button
          onClick={() => setScreen('setup')}
          className="bg-gradient-to-r from-peach to-peach-dark text-white font-semibold py-3 px-7 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg active:scale-95"
        >
          New Puzzle
        </button>
      </div>
    </div>
  );
};

export default JigsawPuzzle;
