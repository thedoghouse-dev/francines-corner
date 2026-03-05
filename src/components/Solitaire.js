import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Solitaire = () => {
  const [deck, setDeck] = useState([]);
  const [waste, setWaste] = useState([]);
  const [foundations, setFoundations] = useState([[], [], [], []]);
  const [tableau, setTableau] = useState([[], [], [], [], [], [], []]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [drawCount, setDrawCount] = useState(1); // 1 or 3

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    checkWin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundations]);

  const initializeGame = () => {
    // Create deck
    const newDeck = [];
    suits.forEach(suit => {
      ranks.forEach((rank, index) => {
        newDeck.push({
          suit,
          rank,
          value: index + 1,
          color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
          id: `${rank}${suit}`
        });
      });
    });

    // Shuffle deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // Deal to tableau
    const newTableau = [[], [], [], [], [], [], []];
    let deckIndex = 0;

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = { ...newDeck[deckIndex], faceUp: row === col };
        newTableau[col].push(card);
        deckIndex++;
      }
    }

    // Remaining cards go to deck
    const remainingDeck = newDeck.slice(deckIndex).map(card => ({ ...card, faceUp: false }));

    setTableau(newTableau);
    setDeck(remainingDeck);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setSelectedCard(null);
    setMoves(0);
    setGameWon(false);
    setHistory([]);
  };

  const saveState = () => {
    setHistory(prev => [...prev, {
      deck: [...deck],
      waste: [...waste],
      foundations: foundations.map(f => [...f]),
      tableau: tableau.map(col => [...col]),
      moves
    }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setDeck(lastState.deck);
    setWaste(lastState.waste);
    setFoundations(lastState.foundations);
    setTableau(lastState.tableau);
    setMoves(lastState.moves);
    setHistory(prev => prev.slice(0, -1));
    setSelectedCard(null);
  };

  const drawCard = () => {
    if (deck.length === 0) {
      // Reset deck from waste
      saveState();
      setDeck(waste.map(card => ({ ...card, faceUp: false })).reverse());
      setWaste([]);
    } else {
      saveState();
      const cardsToDraw = Math.min(drawCount, deck.length);
      const newCards = deck.slice(0, cardsToDraw).map(card => ({ ...card, faceUp: true }));
      setWaste([...newCards, ...waste]);
      setDeck(deck.slice(cardsToDraw));
      setMoves(moves + 1);
    }
    setSelectedCard(null);
  };

  const canPlaceOnFoundation = (card, foundationIndex) => {
    const foundation = foundations[foundationIndex];
    if (foundation.length === 0) {
      return card.rank === 'A';
    }
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  };

  const canPlaceOnTableau = (card, columnIndex) => {
    const column = tableau[columnIndex];
    if (column.length === 0) {
      return card.rank === 'K';
    }
    const topCard = column[column.length - 1];
    return card.color !== topCard.color && card.value === topCard.value - 1;
  };

  const handleCardClick = (card, source, sourceIndex, cardIndex) => {
    if (selectedCard) {
      // Try to move selected card
      const { card: selCard, source: selSource, sourceIndex: selSourceIndex, cardIndex: selCardIndex } = selectedCard;

      if (source === 'foundation' && canPlaceOnFoundation(selCard, sourceIndex)) {
        moveCard(selCard, selSource, selSourceIndex, selCardIndex, 'foundation', sourceIndex);
      } else if (source === 'tableau' && canPlaceOnTableau(selCard, sourceIndex)) {
        moveCard(selCard, selSource, selSourceIndex, selCardIndex, 'tableau', sourceIndex);
      }
      setSelectedCard(null);
    } else {
      // Select card
      if (card.faceUp) {
        setSelectedCard({ card, source, sourceIndex, cardIndex });
      }
    }
  };

  const moveCard = (card, fromSource, fromIndex, cardIndex, toSource, toIndex) => {
    saveState();

    if (fromSource === 'waste') {
      const newWaste = waste.slice(1);
      if (toSource === 'foundation') {
        const newFoundations = [...foundations];
        newFoundations[toIndex] = [...newFoundations[toIndex], card];
        setFoundations(newFoundations);
        setWaste(newWaste);
      } else if (toSource === 'tableau') {
        const newTableau = [...tableau];
        newTableau[toIndex] = [...newTableau[toIndex], card];
        setTableau(newTableau);
        setWaste(newWaste);
      }
    } else if (fromSource === 'tableau') {
      const newTableau = [...tableau];
      const cardsToMove = newTableau[fromIndex].slice(cardIndex);
      newTableau[fromIndex] = newTableau[fromIndex].slice(0, cardIndex);

      // Flip top card if needed
      if (newTableau[fromIndex].length > 0) {
        newTableau[fromIndex][newTableau[fromIndex].length - 1].faceUp = true;
      }

      if (toSource === 'foundation') {
        const newFoundations = [...foundations];
        newFoundations[toIndex] = [...newFoundations[toIndex], card];
        setFoundations(newFoundations);
        setTableau(newTableau);
      } else if (toSource === 'tableau') {
        newTableau[toIndex] = [...newTableau[toIndex], ...cardsToMove];
        setTableau(newTableau);
      }
    }

    setMoves(moves + 1);
  };

  const checkWin = () => {
    const allCardsInFoundation = foundations.every(f => f.length === 13);
    if (allCardsInFoundation && !gameWon) {
      setGameWon(true);
    }
  };

  // Reserved for future auto-move feature
  // const autoMoveToFoundation = (card, source, sourceIndex, cardIndex) => {
  //   for (let i = 0; i < 4; i++) {
  //     if (canPlaceOnFoundation(card, i)) {
  //       moveCard(card, source, sourceIndex, cardIndex, 'foundation', i);
  //       return true;
  //     }
  //   }
  //   return false;
  // };

  const Card = ({ card, onClick, isSelected }) => (
    <div
      onClick={onClick}
      className={`
        relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-lg border-2
        transition-all duration-300 cursor-pointer transform
        ${card.faceUp
          ? 'bg-gradient-to-br from-white to-slate-50 border-slate-grey shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
          : 'bg-gradient-to-br from-spa-teal via-spa-teal-dark to-spa-teal-dark border-spa-teal-dark shadow-md hover:shadow-lg'
        }
        ${isSelected ? 'ring-2 sm:ring-4 ring-gold-leaf scale-110 shadow-2xl' : ''}
      `}
    >
      {card.faceUp ? (
        <div className="flex flex-col items-center justify-center h-full p-1">
          <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${card.color === 'red' ? 'text-red-600' : 'text-charcoal-dark'}`}>
            {card.rank}
          </div>
          <div className={`text-2xl sm:text-3xl md:text-4xl ${card.color === 'red' ? 'text-red-600' : 'text-charcoal-dark'}`}>
            {card.suit}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-xl sm:text-2xl md:text-3xl">🐕</div>
        </div>
      )}
    </div>
  );

  const EmptySlot = ({ onClick, label }) => (
    <div
      onClick={onClick}
      className="w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-lg border-2 border-dashed border-slate-grey-light bg-warm-cream-dark/50 flex items-center justify-center cursor-pointer hover:border-slate-grey hover:bg-slate-grey-light/30 transition-all duration-300 transform hover:scale-105"
    >
      <span className="text-slate-grey text-lg sm:text-xl md:text-2xl font-semibold">{label}</span>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Klondike Solitaire - Classic Card Game | Francine's Corner</title>
        <meta name="description" content="Classic Klondike Solitaire with adjustable difficulty. Large cards, clear visuals, and easy-to-use interface." />

        {/* Open Graph */}
        <meta property="og:title" content="Klondike Solitaire - Classic Card Game | Francine's Corner" />
        <meta property="og:description" content="Classic Klondike Solitaire with adjustable difficulty. Large cards, clear visuals, and easy-to-use interface." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://francinescorner.com/solitaire" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Klondike Solitaire - Classic Card Game | Francine's Corner" />
        <meta name="twitter:description" content="Classic Klondike Solitaire with adjustable difficulty. Large cards, clear visuals, and easy-to-use interface." />
      </Helmet>

      <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-warm-cream via-warm-cream-light to-warm-cream-dark">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-spa-teal-dark">Solitaire</h1>
        <Link to="/" className="btn-secondary text-lg sm:text-xl py-2 px-6 block text-center">
          HOME
        </Link>
      </div>

      {/* Stats and Controls */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="card-elegant flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="text-xl sm:text-2xl text-charcoal">
              <span className="font-semibold">Moves:</span> {moves}
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-lg sm:text-xl text-charcoal font-medium">Draw:</span>
              <button
                onClick={() => setDrawCount(1)}
                className={`py-2 px-4 rounded-lg text-lg sm:text-xl font-semibold transition-all ${
                  drawCount === 1
                    ? 'bg-spa-teal text-white'
                    : 'bg-slate-grey-light text-charcoal hover:bg-slate-grey-light/70'
                }`}
              >
                1
              </button>
              <button
                onClick={() => setDrawCount(3)}
                className={`py-2 px-4 rounded-lg text-lg sm:text-xl font-semibold transition-all ${
                  drawCount === 3
                    ? 'bg-spa-teal text-white'
                    : 'bg-slate-grey-light text-charcoal hover:bg-slate-grey-light/70'
                }`}
              >
                3
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={undo} disabled={history.length === 0} className="btn-secondary text-lg sm:text-xl py-2 px-6 disabled:opacity-50">
              UNDO
            </button>
            <button onClick={initializeGame} className="btn-primary text-lg sm:text-xl py-2 px-6">
              NEW GAME
            </button>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="max-w-7xl mx-auto">
        {/* Top Row: Deck, Waste, and Foundations */}
        <div className="mb-8 flex justify-between">
          {/* Left: Deck and Waste */}
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            <div onClick={drawCard} className="cursor-pointer">
              {deck.length > 0 ? (
                <Card card={deck[0]} onClick={drawCard} />
              ) : (
                <EmptySlot onClick={drawCard} label="↻" />
              )}
            </div>
            <div className="relative">
              {waste.length > 0 ? (
                <div className="relative flex">
                  {waste.slice(0, Math.min(3, waste.length)).reverse().map((card, index) => (
                    <div
                      key={card.id}
                      className="relative"
                      style={{
                        marginLeft: index > 0 ? '-45px' : '0',
                        zIndex: index
                      }}
                    >
                      <Card
                        card={card}
                        onClick={() => index === waste.slice(0, Math.min(3, waste.length)).length - 1
                          ? handleCardClick(waste[0], 'waste', 0, 0)
                          : null
                        }
                        isSelected={selectedCard?.source === 'waste' && index === waste.slice(0, Math.min(3, waste.length)).length - 1}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySlot label="" />
              )}
            </div>
          </div>

          {/* Right: Foundations */}
          <div className="flex gap-1 sm:gap-2 md:gap-3">
            {foundations.map((foundation, index) => (
              <div
                key={index}
                onClick={() => selectedCard && handleCardClick(null, 'foundation', index, 0)}
              >
                {foundation.length > 0 ? (
                  <Card
                    card={foundation[foundation.length - 1]}
                    onClick={() => {}}
                  />
                ) : (
                  <EmptySlot onClick={() => {}} label={suits[index]} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {tableau.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1">
              {column.length === 0 ? (
                <EmptySlot
                  onClick={() => selectedCard && handleCardClick(null, 'tableau', colIndex, 0)}
                  label="K"
                />
              ) : (
                column.map((card, cardIndex) => (
                  <div
                    key={card.id}
                    style={{ marginTop: cardIndex > 0 ? '-52px' : '0' }}
                    className="relative"
                  >
                    <Card
                      card={card}
                      onClick={() => handleCardClick(card, 'tableau', colIndex, cardIndex)}
                      isSelected={selectedCard?.source === 'tableau' && selectedCard?.sourceIndex === colIndex && selectedCard?.cardIndex === cardIndex}
                    />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="card-elegant max-w-2xl mx-4">
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
                <p className="text-5xl sm:text-6xl font-bold mb-6 animate-bounce">
                  🎉 Congratulations! 🎉
                </p>
                <p className="text-2xl sm:text-3xl mb-4">
                  You won in <span className="font-bold text-4xl">{moves}</span> moves!
                </p>
                <p className="text-xl sm:text-2xl mb-8 text-charcoal/80">
                  Draw mode: <span className="font-bold">{drawCount === 1 ? 'Easy (1 card)' : 'Hard (3 cards)'}</span>
                </p>
                <button onClick={initializeGame} className="btn-primary text-xl sm:text-2xl">
                  PLAY AGAIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Solitaire;
