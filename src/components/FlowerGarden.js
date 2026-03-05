import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Flower types ─────────────────────────────────────────────────
const FLOWERS = {
  rose:     { name: 'Rose',           bloom: '🌹', color: '#E75B8D', bg: '#FDE8EC' },
  tulip:    { name: 'Tulip',          bloom: '🌷', color: '#A855F7', bg: '#F3E8FF' },
  sunflower:{ name: 'Sunflower',      bloom: '🌻', color: '#F59E0B', bg: '#FFFBEB' },
  daisy:    { name: 'Daisy',          bloom: '🌼', color: '#CA8A04', bg: '#FEFCE8' },
  cherry:   { name: 'Cherry Blossom', bloom: '🌸', color: '#F9A8C0', bg: '#FDF4FF' },
  bluebell: { name: 'Bluebell',       bloom: '💐', color: '#3B82F6', bg: '#EFF6FF' },
};
const FLOWER_KEYS = Object.keys(FLOWERS);

// ms to spend in each stage before auto-advancing: seed→sprout, sprout→bud, bud→bloom
const STAGE_DURATIONS = [4000, 5000, 6000];
const TOTAL_PLOTS = 20; // 4 × 5

function emptyPlot() {
  return { flowerType: null, stage: 0, nextGrowthAt: null };
}

// ── Stage visuals ────────────────────────────────────────────────
function PlotFace({ plot }) {
  if (plot.stage === 0) {
    return <span className="text-3xl text-amber-300 opacity-40 select-none">+</span>;
  }
  if (plot.stage === 1) {
    // Seed: tiny brown oval
    return (
      <div
        className="w-4 h-3 rounded-full mb-2"
        style={{ background: '#92400e', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
      />
    );
  }
  if (plot.stage === 2) {
    return <span className="text-4xl select-none" style={{ animation: 'growUp 0.4s ease-out' }}>🌱</span>;
  }
  if (plot.stage === 3) {
    return <span className="text-4xl select-none" style={{ animation: 'growUp 0.4s ease-out' }}>🌿</span>;
  }
  // stage 4 — bloom
  return (
    <span
      className="text-5xl select-none"
      style={{ animation: 'bloomIn 0.7s ease-out forwards, sway 4s ease-in-out infinite 0.7s' }}
    >
      {FLOWERS[plot.flowerType].bloom}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────
const FlowerGarden = () => {
  const [plots, setPlots]               = useState(() => Array(TOTAL_PLOTS).fill(null).map(emptyPlot));
  const [selectedFlower, setSelected]   = useState('rose');
  const [gardenFull, setGardenFull]     = useState(false);

  const bloomCount   = plots.filter(p => p.stage === 4).length;
  const growingCount = plots.filter(p => p.stage > 0 && p.stage < 4).length;
  const emptyCount   = TOTAL_PLOTS - bloomCount - growingCount;

  // ── Auto-grow tick (every 500 ms) ────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setPlots(prev => {
        if (!prev.some(p => p.stage > 0 && p.stage < 4)) return prev;
        const now = Date.now();
        return prev.map(p => {
          if (p.stage === 0 || p.stage === 4 || now < p.nextGrowthAt) return p;
          const next = p.stage + 1;
          return { ...p, stage: next, nextGrowthAt: next < 4 ? now + STAGE_DURATIONS[next - 1] : null };
        });
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  // ── Garden-full celebration ──────────────────────────────────
  useEffect(() => {
    if (bloomCount === TOTAL_PLOTS) setGardenFull(true);
  }, [bloomCount]);

  // ── Plot interaction ─────────────────────────────────────────
  const handlePlot = (i) => {
    const p = plots[i];

    if (p.stage === 0) {
      // Plant
      setPlots(prev => prev.map((pl, idx) =>
        idx !== i ? pl : { flowerType: selectedFlower, stage: 1, nextGrowthAt: Date.now() + STAGE_DURATIONS[0] }
      ));
    } else if (p.stage > 0 && p.stage < 4) {
      // Water — shave 2 seconds off next growth
      setPlots(prev => prev.map((pl, idx) =>
        idx !== i ? pl : { ...pl, nextGrowthAt: Math.max(Date.now() + 300, pl.nextGrowthAt - 2000) }
      ));
    } else if (p.stage === 4) {
      // Clear bloomed flower
      setPlots(prev => prev.map((pl, idx) => idx !== i ? pl : emptyPlot()));
      setGardenFull(false);
    }
  };

  const resetGarden = () => {
    setPlots(Array(TOTAL_PLOTS).fill(null).map(emptyPlot));
    setGardenFull(false);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-green-50 via-warm-cream-light to-rose-light">
      <Helmet>
        <title>Flower Garden - Francine's Corner</title>
        <meta name="description" content="Plant seeds and watch your flower garden bloom." />
      </Helmet>

      <style>{`
        @keyframes bloomIn {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          65%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-4deg); }
          50%       { transform: rotate(4deg);  }
        }
        @keyframes growUp {
          from { transform: scaleY(0) translateY(10px); opacity: 0; }
          to   { transform: scaleY(1) translateY(0);    opacity: 1; }
        }
        @keyframes celebration {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-6">
        <Link
          to="/"
          className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-5 rounded-xl shadow-lg text-base"
        >
          ← Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-rose-dark to-green-700">
          Flower Garden
        </h1>
        <button
          onClick={resetGarden}
          className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-5 rounded-xl shadow-lg text-base active:scale-95"
        >
          Reset
        </button>
      </div>

      {/* Garden-full banner */}
      {gardenFull && (
        <div
          className="max-w-2xl mx-auto mb-5 rounded-2xl border-4 border-rose p-4 text-center shadow-xl"
          style={{ background: 'linear-gradient(to right, #FDE8EC, #F3E8FF, #FDE8EC)', animation: 'celebration 2s ease-in-out infinite' }}
        >
          <p className="text-2xl sm:text-3xl font-script font-bold text-rose-dark">
            ✿ Your garden is in full bloom! ✿
          </p>
          <p className="text-slate-grey mt-1">Tap any flower to clear it and plant again</p>
        </div>
      )}

      {/* Flower selector */}
      <div className="max-w-2xl mx-auto mb-5">
        <p className="text-center text-slate-grey-dark font-semibold mb-3 text-lg">
          Choose a flower to plant:
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {FLOWER_KEYS.map(key => {
            const f = FLOWERS[key];
            const active = selectedFlower === key;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-4 text-base font-semibold transition-all duration-200 shadow-md focus:outline-none
                  ${active ? 'scale-110 shadow-xl' : 'bg-white border-white hover:scale-105'}`}
                style={active ? { backgroundColor: f.bg, borderColor: f.color, color: f.color } : {}}
              >
                <span className="text-2xl">{f.bloom}</span>
                <span className="hidden sm:inline">{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Garden grid */}
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-3xl border-4 border-green-300 shadow-2xl p-3 sm:p-4"
          style={{
            background: 'linear-gradient(to bottom, #dcfce7, #fef3c7)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}
        >
          {plots.map((plot, i) => {
            const f = plot.flowerType ? FLOWERS[plot.flowerType] : null;
            const isBloom   = plot.stage === 4;
            const isGrowing = plot.stage > 0 && plot.stage < 4;
            const isEmpty   = plot.stage === 0;

            return (
              <button
                key={i}
                onClick={() => handlePlot(i)}
                className={`relative flex flex-col items-center justify-end aspect-square rounded-2xl transition-all duration-200 focus:outline-none overflow-hidden
                  ${isEmpty   ? 'bg-amber-100 border-2 border-amber-300 hover:bg-amber-200 hover:scale-105' : ''}
                  ${isGrowing ? 'hover:scale-105' : ''}
                  ${isBloom   ? 'hover:scale-105 hover:opacity-80' : ''}
                `}
                style={
                  f && !isEmpty
                    ? { backgroundColor: f.bg, borderWidth: 3, borderStyle: 'solid', borderColor: f.color }
                    : {}
                }
                title={isEmpty ? 'Plant a flower' : isBloom ? 'Tap to clear' : 'Tap to water 💧'}
              >
                {/* Soil strip */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 rounded-b-2xl" style={{ background: 'rgba(120,60,20,0.15)' }} />

                {/* Plant face */}
                <div className="relative z-10 flex items-center justify-center flex-1 pb-1">
                  <PlotFace plot={plot} />
                </div>

                {/* Water hint */}
                {isGrowing && (
                  <div className="absolute top-1 right-1 text-base opacity-50 select-none">💧</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto mt-4 text-center text-slate-grey-dark text-lg">
        🌸 <strong>{bloomCount}</strong> blooming &nbsp;·&nbsp;
        🌱 <strong>{growingCount}</strong> growing &nbsp;·&nbsp;
        🟫 <strong>{emptyCount}</strong> empty
      </div>

      <p className="text-center text-slate-grey mt-2 text-sm">
        Tap an empty plot to plant · Tap a growing plant to water it 💧 · Tap a bloomed flower to clear it
      </p>
    </div>
  );
};

export default FlowerGarden;
