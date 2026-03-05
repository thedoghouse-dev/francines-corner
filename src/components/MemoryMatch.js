import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [canClick, setCanClick] = useState(true);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [celebrating, setCelebrating] = useState(null);

  // All available card icons - vibrant and diverse
  const allCardPairs = [
    {
      id: 1,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ),
      name: 'Heart',
      color: 'text-red-500'
    },
    {
      id: 2,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ),
      name: 'Star',
      color: 'text-yellow-500'
    },
    {
      id: 3,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      name: 'Check',
      color: 'text-green-500'
    },
    {
      id: 4,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      name: 'Diamond',
      color: 'text-cyan-500'
    },
    {
      id: 5,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
      name: 'Location',
      color: 'text-purple-500'
    },
    {
      id: 6,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      ),
      name: 'Code',
      color: 'text-indigo-500'
    },
    {
      id: 7,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
      name: 'Person',
      color: 'text-orange-500'
    },
    {
      id: 8,
      icon: (
        <svg className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
        </svg>
      ),
      name: 'Gift',
      color: 'text-pink-500'
    },
  ];

  // Initialize game when difficulty changes
  useEffect(() => {
    if (gameStarted) {
      initializeGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const getDifficultySettings = (diff = difficulty) => {
    switch(diff) {
      case 'easy':
        return { pairs: 3, gridCols: 3 }; // 6 cards
      case 'medium':
        return { pairs: 6, gridCols: 4 }; // 12 cards
      case 'hard':
        return { pairs: 8, gridCols: 4 }; // 16 cards
      default:
        return { pairs: 3, gridCols: 3 };
    }
  };

  const initializeGame = (diff = difficulty) => {
    const { pairs } = getDifficultySettings(diff);

    // Select random card pairs based on difficulty
    const selectedPairs = [...allCardPairs]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairs);

    // Create pairs and shuffle
    const shuffledCards = [...selectedPairs, ...selectedPairs]
      .map((card, index) => ({ ...card, uniqueId: index }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setCanClick(true);
    setGameStarted(true);
    setCelebrating(null);
  };

  const handleCardClick = (index) => {
    if (!canClick) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairs.includes(cards[index].id)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setCanClick(false);
      setMoves(moves + 1);

      const [firstIndex, secondIndex] = newFlipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.id === secondCard.id) {
        // Match found - celebrate!
        setCelebrating(firstCard.id);
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.id]);
          setFlippedIndices([]);
          setCanClick(true);
          setCelebrating(null);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
          setCanClick(true);
        }, 1200);
      }
    }
  };

  const isCardFlipped = (index) => {
    return flippedIndices.includes(index) || matchedPairs.includes(cards[index]?.id);
  };

  const isCardCelebrating = (index) => {
    return celebrating === cards[index]?.id;
  };

  const isGameComplete = gameStarted && matchedPairs.length === getDifficultySettings().pairs;

  return (
    <>
      <Helmet>
        <title>Memory Match Game - Colorful Card Matching | Francine's Corner</title>
        <meta name="description" content="Match colorful pairs in this gentle memory game. Three difficulty levels with vibrant icons and smooth animations." />

        {/* Open Graph */}
        <meta property="og:title" content="Memory Match Game - Colorful Card Matching | Francine's Corner" />
        <meta property="og:description" content="Match colorful pairs in this gentle memory game. Three difficulty levels with vibrant icons and smooth animations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://francinescorner.com/memory-match" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Memory Match Game - Colorful Card Matching | Francine's Corner" />
        <meta name="twitter:description" content="Match colorful pairs in this gentle memory game. Three difficulty levels with vibrant icons and smooth animations." />
      </Helmet>

      <div className="h-screen overflow-hidden flex flex-col p-4 sm:p-6 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 text-4xl text-rose">❀</div>
        <div className="absolute top-20 right-10 text-4xl text-lavender">✿</div>
        <div className="absolute bottom-20 left-10 text-4xl text-peach">✿</div>
        <div className="absolute bottom-10 right-10 text-4xl text-rose">❀</div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark to-lavender-dark">
          Memory Match
        </h1>
        <Link to="/" className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg sm:text-xl active:scale-95 block text-center">
          Home
        </Link>
      </div>

      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full overflow-y-auto">
        {!gameStarted ? (
          /* Difficulty Selection Screen */
          <div className="card-elegant bg-gradient-to-br from-white via-rose-light to-white border-2 border-rose-DEFAULT relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark to-lavender-dark mb-2">
                Choose Your Challenge
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl text-rose">✿</span>
                <p className="text-xl sm:text-2xl text-slate-grey-dark font-light">
                  Click a card to begin
                </p>
                <span className="text-2xl text-lavender">✿</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => {
                  setDifficulty('easy');
                  initializeGame('easy');
                }}
                className="bg-green-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-green-700 mb-2">Easy</h3>
                <p className="text-lg text-green-600 font-semibold">3 pairs (6 cards)</p>
                <p className="text-md text-slate-grey mt-2">Perfect for beginners</p>
              </button>
              <button
                onClick={() => {
                  setDifficulty('medium');
                  initializeGame('medium');
                }}
                className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-yellow-700 mb-2">Medium</h3>
                <p className="text-lg text-yellow-600 font-semibold">6 pairs (12 cards)</p>
                <p className="text-md text-slate-grey mt-2">A good challenge</p>
              </button>
              <button
                onClick={() => {
                  setDifficulty('hard');
                  initializeGame('hard');
                }}
                className="bg-red-50 p-6 rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-left"
              >
                <h3 className="text-2xl font-bold text-red-700 mb-2">Hard</h3>
                <p className="text-lg text-red-600 font-semibold">8 pairs (16 cards)</p>
                <p className="text-md text-slate-grey mt-2">Expert level</p>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Game Stats */}
            <div className="card-elegant mb-3 sm:mb-4 p-4">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="text-xl sm:text-2xl text-charcoal">
                  <span className="font-semibold">Moves:</span> {moves}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl text-slate-grey font-medium">
                    Difficulty:
                  </span>
                  <span className={`
                    text-lg sm:text-xl font-bold px-3 py-1 rounded-lg text-white
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
                    setCards([]);
                    setFlippedIndices([]);
                    setMatchedPairs([]);
                    setMoves(0);
                  }}
                  className="btn-secondary text-base sm:text-lg py-2 px-4"
                >
                  CHANGE
                </button>
              </div>
            </div>

            {/* Instructions */}
            {!isGameComplete && (
              <div className="card-elegant mb-3 sm:mb-4 p-3 sm:p-4 text-center bg-gradient-to-r from-spa-teal/10 to-spa-teal-light/10">
                <p className="text-lg sm:text-xl md:text-2xl text-charcoal">
                  Click cards to find <span className="font-bold text-spa-teal-dark">matching pairs</span>
                </p>
              </div>
            )}

            {/* Card Grid */}
            {cards.length > 0 && (
              <div className={`
                grid gap-3 sm:gap-4 mb-4 w-full
                ${getDifficultySettings().gridCols === 3 ? 'grid-cols-3 max-w-xl mx-auto' : 'grid-cols-4 max-w-3xl mx-auto'}
              `}>
                {cards.map((card, index) => (
                  <button
                  key={card.uniqueId}
                  onClick={() => handleCardClick(index)}
                  disabled={!canClick && !flippedIndices.includes(index)}
                  className={`
                    aspect-square rounded-2xl transition-all duration-500
                    flex items-center justify-center
                    shadow-lg transform
                    ${isCardFlipped(index)
                      ? `bg-gradient-to-br from-white to-slate-50 border-4 ${card.color} scale-100`
                      : 'bg-gradient-to-br from-slate-grey to-slate-grey-dark text-transparent hover:from-slate-grey-light hover:to-slate-grey hover:scale-105 active:scale-95'
                    }
                    ${isCardCelebrating(index) ? 'animate-bounce ring-4 ring-gold-leaf' : ''}
                  `}
                  style={{
                    transformStyle: 'preserve-3d',
                    animation: isCardFlipped(index) ? 'flipCard 0.6s ease-in-out' : 'none'
                  }}
                >
                  {isCardFlipped(index) && (
                    <div className={`${card.color} transform transition-all duration-300`}>
                      {card.icon}
                    </div>
                  )}
                </button>
              ))}
              </div>
            )}

            {/* Victory Message - Centered Modal Overlay */}
            {isGameComplete && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn p-4">
                <div className="card-elegant max-w-2xl w-full">
                  <div className="gold-box text-center relative overflow-hidden">
                    {/* Celebration particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 bg-gold-leaf rounded-full animate-float"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative z-10">
                      <p className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 animate-bounce">
                        🎉 Wonderful! 🎉
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4">
                        You completed the puzzle in <span className="font-bold text-3xl sm:text-4xl">{moves}</span> moves
                      </p>
                      <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-charcoal/80">
                        Difficulty: <span className="font-bold">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                      </p>
                      <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
                        <button
                          onClick={initializeGame}
                          className="btn-primary text-lg sm:text-xl md:text-2xl py-3 sm:py-4 px-6 sm:px-8"
                        >
                          PLAY AGAIN
                        </button>
                        <button
                          onClick={() => {
                            setGameStarted(false);
                            setCards([]);
                            setFlippedIndices([]);
                            setMatchedPairs([]);
                            setMoves(0);
                          }}
                          className="btn-secondary text-lg sm:text-xl md:text-2xl py-3 sm:py-4 px-6 sm:px-8"
                        >
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
    </div>
    </>
  );
};

export default MemoryMatch;
