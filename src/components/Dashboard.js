import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Dashboard = () => {
  // Get formatted date for display
  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const formattedDate = getFormattedDate();

  return (
    <>
      <Helmet>
        <title>Francine's Corner - Memory Games & Activities for Cognitive Wellness</title>
        <meta name="description" content="Premium digital activity suite featuring Memory Match, Word Search, and Solitaire. Designed with love for seniors and cognitive wellness." />

        {/* Open Graph */}
        <meta property="og:title" content="Francine's Corner - Memory Games & Activities for Cognitive Wellness" />
        <meta property="og:description" content="Premium digital activity suite featuring Memory Match, Word Search, and Solitaire. Designed with love for seniors and cognitive wellness." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://francinescorner.com/" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Francine's Corner - Memory Games & Activities for Cognitive Wellness" />
        <meta name="twitter:description" content="Premium digital activity suite featuring Memory Match, Word Search, and Solitaire. Designed with love for seniors and cognitive wellness." />
      </Helmet>

      <div className="min-h-screen p-6 sm:p-12 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-6xl text-rose">❀</div>
        <div className="absolute top-40 right-20 text-6xl text-lavender">✿</div>
        <div className="absolute bottom-40 left-20 text-6xl text-peach">❀</div>
        <div className="absolute bottom-20 right-10 text-6xl text-rose">✿</div>
      </div>

      {/* Header */}
      <header className="text-center mb-12 relative z-10">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark via-lavender-dark to-rose-dark mb-4 animate-fadeIn">
          Francine's Corner
        </h1>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl text-rose">✿</span>
          <p className="text-2xl sm:text-3xl font-display text-slate-grey-dark">
            {formattedDate}
          </p>
          <span className="text-3xl text-lavender">✿</span>
        </div>
        <p className="text-lg sm:text-xl font-light text-slate-grey italic">
          Choose an activity to begin
        </p>
      </header>

      {/* Activity Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">

        {/* Jigsaw Puzzle Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-green-50 to-white border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl opacity-40" style={{color:'#166534'}}>❀</div>
          <div className="absolute top-2 right-2 text-3xl opacity-40" style={{color:'#16a34a'}}>✿</div>
          <div className="absolute bottom-2 left-2 text-3xl opacity-40" style={{color:'#16a34a'}}>✿</div>
          <div className="absolute bottom-2 right-2 text-3xl opacity-40" style={{color:'#166534'}}>❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white"
                 style={{background:'linear-gradient(135deg,#4ade80,#166534)'}}>
              <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
              </svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold mb-3" style={{color:'#166534'}}>
              Jigsaw Puzzle
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Assemble a photo piece by piece
            </p>
          </div>
          <Link
            to="/jigsaw"
            className="w-full text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
            style={{background:'linear-gradient(to right,#4ade80,#166534)'}}
          >
            Play
          </Link>
        </div>

        {/* Solitaire Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-peach-light to-white border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl text-peach-dark opacity-40">❀</div>
          <div className="absolute top-2 right-2 text-3xl text-peach opacity-40">✿</div>
          <div className="absolute bottom-2 left-2 text-3xl text-peach opacity-40">✿</div>
          <div className="absolute bottom-2 right-2 text-3xl text-peach-dark opacity-40">❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-peach to-peach-dark rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold text-peach-dark mb-3">
              Solitaire
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Classic card game with hints
            </p>
          </div>
          <Link
            to="/solitaire"
            className="w-full bg-gradient-to-r from-peach to-peach-dark text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
          >
            Play
          </Link>
        </div>

        {/* Word Search Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-lavender-light to-white border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl text-lavender-dark opacity-40">❀</div>
          <div className="absolute top-2 right-2 text-3xl text-lavender opacity-40">✿</div>
          <div className="absolute bottom-2 left-2 text-3xl text-lavender opacity-40">✿</div>
          <div className="absolute bottom-2 right-2 text-3xl text-lavender-dark opacity-40">❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-lavender to-lavender-dark rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold text-lavender-dark mb-3">
              Word Search
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Find hidden words in the grid
            </p>
          </div>
          <Link
            to="/word-search"
            className="w-full bg-gradient-to-r from-lavender to-lavender-dark text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
          >
            Start
          </Link>
        </div>

        {/* Mahjongg Solitaire Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-spa-teal/10 to-white border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl text-spa-teal-dark opacity-40">❀</div>
          <div className="absolute top-2 right-2 text-3xl text-spa-teal opacity-40">✿</div>
          <div className="absolute bottom-2 left-2 text-3xl text-spa-teal opacity-40">✿</div>
          <div className="absolute bottom-2 right-2 text-3xl text-spa-teal-dark opacity-40">❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-spa-teal to-spa-teal-dark rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold text-spa-teal-dark mb-3">
              Mahjongg Solitaire
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Match tile pairs to clear the board
            </p>
          </div>
          <Link
            to="/mahjongg"
            className="w-full bg-gradient-to-r from-spa-teal to-spa-teal-dark text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
          >
            Play
          </Link>
        </div>

        {/* Memory Match Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-rose-light to-white border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl text-rose-dark opacity-40">❀</div>
          <div className="absolute top-2 right-2 text-3xl text-rose opacity-40">✿</div>
          <div className="absolute bottom-2 left-2 text-3xl text-rose opacity-40">✿</div>
          <div className="absolute bottom-2 right-2 text-3xl text-rose-dark opacity-40">❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-rose to-rose-dark rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold text-rose-dark mb-3">
              Memory Match
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Match pairs to win
            </p>
          </div>
          <Link
            to="/memory-match"
            className="w-full bg-gradient-to-r from-rose to-rose-dark text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
          >
            Play
          </Link>
        </div>

        {/* Sudoku Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-blue-50 to-white border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl opacity-40" style={{color:'#1D4ED8'}}>❀</div>
          <div className="absolute top-2 right-2 text-3xl opacity-40" style={{color:'#3B82F6'}}>✿</div>
          <div className="absolute bottom-2 left-2 text-3xl opacity-40" style={{color:'#3B82F6'}}>✿</div>
          <div className="absolute bottom-2 right-2 text-3xl opacity-40" style={{color:'#1D4ED8'}}>❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white"
                 style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)'}}>
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold mb-3" style={{color:'#1D4ED8'}}>
              Sudoku
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Fill the grid with numbers 1–9
            </p>
          </div>
          <Link
            to="/sudoku"
            className="w-full text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
            style={{background:'linear-gradient(to right,#3B82F6,#1D4ED8)'}}
          >
            Play
          </Link>
        </div>

        {/* Flower Garden Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-green-50 to-rose-light border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl opacity-40" style={{color:'#15803d'}}>❀</div>
          <div className="absolute top-2 right-2 text-3xl opacity-40" style={{color:'#E75B8D'}}>✿</div>
          <div className="absolute bottom-2 left-2 text-3xl opacity-40" style={{color:'#E75B8D'}}>✿</div>
          <div className="absolute bottom-2 right-2 text-3xl opacity-40" style={{color:'#15803d'}}>❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white"
                 style={{background:'linear-gradient(135deg,#86efac,#15803d)'}}>
              <span className="text-5xl">🌸</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold mb-3" style={{color:'#15803d'}}>
              Flower Garden
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Plant seeds and watch them bloom
            </p>
          </div>
          <Link
            to="/flower-garden"
            className="w-full text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
            style={{background:'linear-gradient(to right,#86efac,#15803d)'}}
          >
            Play
          </Link>
        </div>

        {/* Bubble Pop Card */}
        <div className="rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-white via-lavender-light to-rose-light border-4 border-white shadow-xl relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-2 left-2 text-3xl text-lavender-dark opacity-40">❀</div>
          <div className="absolute top-2 right-2 text-3xl text-rose opacity-40">✿</div>
          <div className="absolute bottom-2 left-2 text-3xl text-rose opacity-40">✿</div>
          <div className="absolute bottom-2 right-2 text-3xl text-lavender-dark opacity-40">❀</div>

          <div className="text-center mb-6 relative z-10">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-12 border-4 border-white"
                 style={{background:'linear-gradient(135deg,#F9A8C0,#C4B5FD,#93C5FD)'}}>
              <span className="text-5xl">🫧</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark to-lavender-dark mb-3">
              Bubble Pop
            </h3>
            <p className="text-lg sm:text-xl text-slate-grey-dark font-light mb-6">
              Swap & match 3 bubbles to pop!
            </p>
          </div>
          <Link
            to="/bubble-pop"
            className="w-full text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xl active:scale-95 relative z-10 block text-center"
            style={{background:'linear-gradient(to right,#F9A8C0,#C4B5FD)'}}
          >
            Play
          </Link>
        </div>

      </div>

      {/* About link - subtle in bottom right corner */}
      <div className="fixed bottom-6 right-6 z-20">
        <Link
          to="/about"
          className="text-slate-grey-dark hover:text-rose-dark transition-colors duration-300 text-sm font-light underline decoration-dotted"
        >
          About
        </Link>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
