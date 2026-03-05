import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const WordSearch = () => {
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [firstClick, setFirstClick] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);

  // Word bank for puzzle generation
  const WORD_BANK = [
    'SCHNAUZER', 'LOYAL', 'FRIEND', 'BARK', 'PLAY', 'WALK',
    'FETCH', 'TREAT', 'CUDDLE', 'GENTLE', 'SMART', 'BRAVE',
    'HOME', 'HAPPY', 'TRUST', 'CARE', 'KIND', 'CALM',
    'PEACE', 'GUARD', 'WATCH', 'LOVE', 'FAMILY', 'PATIENT',
    'NOBLE', 'GRACE', 'DEVOTED', 'PROTECT', 'COMPANION'
  ];

  // Generate puzzle when difficulty changes
  useEffect(() => {
    if (gameStarted) {
      generatePuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const getDifficultySettings = (diff = difficulty) => {
    switch(diff) {
      case 'easy':
        return { gridSize: 6, wordCount: 4 };
      case 'medium':
        return { gridSize: 8, wordCount: 6 };
      case 'hard':
        return { gridSize: 10, wordCount: 8 };
      default:
        return { gridSize: 6, wordCount: 4 };
    }
  };

  const generatePuzzle = (diff = difficulty) => {
    const { gridSize, wordCount } = getDifficultySettings(diff);

    // Randomly select words from the word bank
    const shuffledBank = [...WORD_BANK].sort(() => Math.random() - 0.5);
    const wordList = shuffledBank.slice(0, wordCount);
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    const placedWords = [];

    // Place words horizontally and vertically
    wordList.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 50) {
        const horizontal = Math.random() > 0.5;
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (horizontal && col + word.length <= gridSize) {
          // Check if space is available
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            // Place word
            const cells = [];
            for (let i = 0; i < word.length; i++) {
              newGrid[row][col + i] = word[i];
              cells.push({ row, col: col + i });
            }
            placedWords.push({ word, cells });
            placed = true;
          }
        } else if (!horizontal && row + word.length <= gridSize) {
          // Check if space is available
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== '' && newGrid[row + i][col] !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            // Place word
            const cells = [];
            for (let i = 0; i < word.length; i++) {
              newGrid[row + i][col] = word[i];
              cells.push({ row: row + i, col });
            }
            placedWords.push({ word, cells });
            placed = true;
          }
        }

        attempts++;
      }
    });

    // Fill empty cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGrid(newGrid);
    setWords(placedWords);
    setFoundWords([]);
    setSelectedCells([]);
    setFirstClick(null);
    setGameStarted(true);
  };

  const handleCellClick = (row, col) => {
    if (!firstClick) {
      // First click - select starting cell
      setFirstClick({ row, col });
      setSelectedCells([{ row, col }]);
    } else {
      // Second click - try to find word between first and second click
      const cells = getCellsBetween(firstClick, { row, col });

      if (cells.length > 1) {
        const selectedWord = cells.map(cell => grid[cell.row][cell.col]).join('');
        const matchedWord = words.find(w =>
          w.word === selectedWord && !foundWords.includes(w.word)
        );

        if (matchedWord) {
          setFoundWords([...foundWords, matchedWord.word]);
          setSelectedCells([]);
          setFirstClick(null);
        } else {
          // Invalid selection - clear and start over
          setFirstClick(null);
          setSelectedCells([]);
        }
      } else {
        // Same cell clicked or invalid - clear selection
        setFirstClick(null);
        setSelectedCells([]);
      }
    }
  };

  const getCellsBetween = (start, end) => {
    const cells = [];

    // Horizontal
    if (start.row === end.row) {
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      for (let col = minCol; col <= maxCol; col++) {
        cells.push({ row: start.row, col });
      }
    }
    // Vertical
    else if (start.col === end.col) {
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      for (let row = minRow; row <= maxRow; row++) {
        cells.push({ row, col: start.col });
      }
    }

    return cells;
  };

  const isCellInFoundWord = (row, col) => {
    return words.some(w =>
      foundWords.includes(w.word) &&
      w.cells.some(cell => cell.row === row && cell.col === col)
    );
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const allWordsFound = foundWords.length === words.length;

  return (
    <>
      <Helmet>
        <title>Word Search Puzzle - Find Hidden Words | Francine's Corner</title>
        <meta name="description" content="Find hidden words in beautifully designed grids. Three difficulty levels from 6x6 to 10x10." />

        {/* Open Graph */}
        <meta property="og:title" content="Word Search Puzzle - Find Hidden Words | Francine's Corner" />
        <meta property="og:description" content="Find hidden words in beautifully designed grids. Three difficulty levels from 6x6 to 10x10." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://francinescorner.com/word-search" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Word Search Puzzle - Find Hidden Words | Francine's Corner" />
        <meta name="twitter:description" content="Find hidden words in beautifully designed grids. Three difficulty levels from 6x6 to 10x10." />
      </Helmet>

      <div className="h-screen flex flex-col p-4 sm:p-6 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 text-4xl text-rose">❀</div>
        <div className="absolute top-20 right-10 text-4xl text-lavender">✿</div>
        <div className="absolute bottom-20 left-10 text-4xl text-peach">✿</div>
        <div className="absolute bottom-10 right-10 text-4xl text-rose">❀</div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-3 relative z-10 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-lavender-dark to-rose-dark">
          Word Search
        </h1>
        <Link to="/" className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg active:scale-95 block text-center">
          Home
        </Link>
      </div>

      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full overflow-y-auto relative z-10">
        {!gameStarted ? (
          /* Difficulty Selection Screen */
          <div className="card-elegant bg-gradient-to-br from-white via-lavender-light to-white border-2 border-lavender-DEFAULT relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-lavender-dark to-rose-dark mb-2">
                Choose Your Challenge
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl text-lavender">✿</span>
                <p className="text-xl sm:text-2xl text-slate-grey-dark font-light">
                  Click a card to begin
                </p>
                <span className="text-2xl text-rose">✿</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => {
                  setDifficulty('easy');
                  generatePuzzle('easy');
                }}
                className="bg-green-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-green-700 mb-2">Easy</h3>
                <p className="text-lg text-green-600 font-semibold">6×6 grid, 4 words</p>
                <p className="text-md text-slate-grey mt-2">Great for beginners</p>
              </button>
              <button
                onClick={() => {
                  setDifficulty('medium');
                  generatePuzzle('medium');
                }}
                className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-yellow-700 mb-2">Medium</h3>
                <p className="text-lg text-yellow-600 font-semibold">8×8 grid, 6 words</p>
                <p className="text-md text-slate-grey mt-2">Good challenge</p>
              </button>
              <button
                onClick={() => {
                  setDifficulty('hard');
                  generatePuzzle('hard');
                }}
                className="bg-red-50 p-6 rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-red-700 mb-2">Hard</h3>
                <p className="text-lg text-red-600 font-semibold">10×10 grid, 8 words</p>
                <p className="text-md text-slate-grey mt-2">Expert level</p>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Game Stats and Controls */}
            <div className="card-elegant mb-2 p-3 flex-shrink-0">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2 text-base sm:text-lg text-charcoal">
                  <span className="font-semibold">Found:</span> {foundWords.length} / {words.length}
                  <span className={`
                    ml-2 text-sm sm:text-base font-bold px-2 py-1 rounded-lg text-white
                    ${difficulty === 'easy' ? 'bg-green-500' : ''}
                    ${difficulty === 'medium' ? 'bg-yellow-500' : ''}
                    ${difficulty === 'hard' ? 'bg-red-500' : ''}
                  `}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setGameStarted(false);
                    setGrid([]);
                    setWords([]);
                    setFoundWords([]);
                    setSelectedCells([]);
                    setFirstClick(null);
                  }}
                  className="btn-secondary text-sm sm:text-base py-1 px-3"
                >
                  CHANGE
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="card-elegant mb-2 p-2 text-center bg-gradient-to-r from-spa-teal/10 to-spa-teal-light/10 flex-shrink-0">
              <p className="text-sm sm:text-base text-charcoal">
                Click <span className="font-bold text-spa-teal-dark">FIRST</span> letter, then <span className="font-bold text-spa-teal-dark">LAST</span> letter
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
              {/* Word Grid */}
              <div className="lg:col-span-2 min-h-0">
                <div className="card-elegant bg-gradient-to-br from-white to-slate-50 p-3 h-full flex items-center justify-center">
                  <div className={`
                    grid gap-1 sm:gap-2
                    ${getDifficultySettings().gridSize === 6 ? 'grid-cols-6' : ''}
                    ${getDifficultySettings().gridSize === 8 ? 'grid-cols-8' : ''}
                    ${getDifficultySettings().gridSize === 10 ? 'grid-cols-10' : ''}
                  `}>
                    {grid.map((row, rowIndex) =>
                      row.map((letter, colIndex) => (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`
                            aspect-square rounded-lg font-bold
                            transition-all duration-300 active:scale-95 transform
                            ${getDifficultySettings().gridSize === 10 ? 'text-xl sm:text-2xl' : getDifficultySettings().gridSize === 8 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}
                            ${isCellInFoundWord(rowIndex, colIndex)
                              ? 'bg-gradient-to-br from-spa-teal to-spa-teal-light text-white border-2 border-spa-teal-dark shadow-lg scale-105'
                              : isCellSelected(rowIndex, colIndex)
                              ? 'bg-gradient-to-br from-gold-leaf to-gold-leaf-light text-white border-2 border-gold-leaf-dark shadow-lg scale-105'
                              : 'bg-warm-cream-dark text-charcoal hover:bg-gradient-to-br hover:from-slate-grey-light hover:to-slate-grey hover:text-white hover:scale-105 shadow-md'
                            }
                          `}
                        >
                          {letter}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Word List */}
              <div className="min-h-0 flex flex-col">
                <div className="card-elegant p-4 flex-1 flex flex-col overflow-y-auto">
                  <h2 className="text-xl sm:text-2xl font-semibold text-charcoal mb-3 text-center flex-shrink-0">
                    Words to Find
                  </h2>
                  <ul className="space-y-2 flex-1 overflow-y-auto">
                    {words.map((w, index) => (
                      <li
                        key={index}
                        className={`
                          text-xl sm:text-2xl py-2 px-3 rounded-lg text-center font-medium
                          transition-all duration-500 transform
                          ${foundWords.includes(w.word)
                            ? 'bg-gradient-to-r from-spa-teal to-spa-teal-light text-white line-through scale-105 shadow-lg'
                            : 'bg-warm-cream-dark text-charcoal hover:bg-slate-grey-light/30'
                          }
                        `}
                      >
                        {w.word}
                      </li>
                    ))}
                  </ul>

                  {allWordsFound && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn p-4">
                      <div className="card-elegant max-w-2xl w-full">
                        <div className="gold-box">
                          <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 animate-bounce">
                            🎉 Excellent Work! 🎉
                          </p>
                          <p className="text-xl sm:text-2xl text-center mb-6 text-charcoal/80">
                            You found all the words!
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                              onClick={generatePuzzle}
                              className="btn-primary text-lg sm:text-xl md:text-2xl py-3 px-6"
                            >
                              NEW PUZZLE
                            </button>
                            <button
                              onClick={() => {
                                setGameStarted(false);
                                setGrid([]);
                                setWords([]);
                                setFoundWords([]);
                                setSelectedCells([]);
                                setFirstClick(null);
                              }}
                              className="btn-secondary text-lg sm:text-xl md:text-2xl py-3 px-6"
                            >
                              CHANGE DIFFICULTY
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default WordSearch;
