import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Francine's Corner - Thoughtfully Designed Senior Activities</title>
        <meta name="description" content="Learn about Francine's Corner, a digital activity suite designed with accessibility, comfort, and cognitive wellness in mind." />

        {/* Open Graph */}
        <meta property="og:title" content="About Francine's Corner - Thoughtfully Designed Senior Activities" />
        <meta property="og:description" content="Learn about Francine's Corner, a digital activity suite designed with accessibility, comfort, and cognitive wellness in mind." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://francinescorner.com/about" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Francine's Corner - Thoughtfully Designed Senior Activities" />
        <meta name="twitter:description" content="Learn about Francine's Corner, a digital activity suite designed with accessibility, comfort, and cognitive wellness in mind." />
      </Helmet>

      <div className="min-h-screen p-6 sm:p-12 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-6xl text-rose">❀</div>
        <div className="absolute top-40 right-20 text-6xl text-lavender">✿</div>
        <div className="absolute bottom-40 left-20 text-6xl text-peach">❀</div>
        <div className="absolute bottom-20 right-10 text-6xl text-rose">✿</div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark via-lavender-dark to-rose-dark mb-6 animate-fadeIn">
            About Francine's Corner
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-3xl text-rose">✿</span>
            <span className="text-3xl text-lavender">❀</span>
            <span className="text-3xl text-peach">✿</span>
          </div>
        </header>

        {/* About Content Card */}
        <div className="rounded-3xl p-8 sm:p-12 bg-white/80 backdrop-blur-sm border-4 border-white shadow-2xl mb-8 relative overflow-hidden">
          {/* Decorative corner flourishes */}
          <div className="absolute top-3 left-3 text-4xl text-rose opacity-20">❀</div>
          <div className="absolute top-3 right-3 text-4xl text-lavender opacity-20">✿</div>
          <div className="absolute bottom-3 left-3 text-4xl text-peach opacity-20">✿</div>
          <div className="absolute bottom-3 right-3 text-4xl text-rose opacity-20">❀</div>

          <div className="relative z-10 space-y-6 text-slate-grey-dark">
            <div>
              <h2 className="text-3xl font-script font-bold text-rose-dark mb-4">
                A Digital Activity Suite
              </h2>
              <p className="text-lg sm:text-xl leading-relaxed">
                Francine's Corner is a thoughtfully designed collection of digital activities created to provide
                engaging and enjoyable experiences for seniors. Each activity is crafted with care,
                featuring calming colors, clear visuals, and intuitive controls.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-script font-bold text-lavender-dark mb-4">
                Our Activities
              </h2>
              <div className="space-y-4 text-lg sm:text-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-peach mt-1">✿</span>
                  <div>
                    <strong className="text-peach-dark">Jigsaw Puzzle:</strong>
                    <span className="ml-2">Drag and snap real interlocking pieces together from a choice of photos — or upload your own. Available in 16, 36, and 64 pieces.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-peach mt-1">✿</span>
                  <div>
                    <strong className="text-peach-dark">Solitaire:</strong>
                    <span className="ml-2">Classic card game with helpful hints and adjustable difficulty levels.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-lavender mt-1">✿</span>
                  <div>
                    <strong className="text-lavender-dark">Word Search:</strong>
                    <span className="ml-2">Find hidden words in beautifully designed grids with various difficulty options.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-spa-teal mt-1">✿</span>
                  <div>
                    <strong className="text-spa-teal-dark">Mahjongg Solitaire:</strong>
                    <span className="ml-2">Clear the board by matching pairs of tiles in this timeless classic.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-rose mt-1">✿</span>
                  <div>
                    <strong className="text-rose-dark">Memory Match:</strong>
                    <span className="ml-2">Match colorful pairs to exercise memory in a gentle, rewarding way.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1" style={{color:'#3B82F6'}}>✿</span>
                  <div>
                    <strong style={{color:'#1D4ED8'}}>Sudoku:</strong>
                    <span className="ml-2">Fill the 9×9 grid using logic and deduction — a wonderful daily brain workout.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1" style={{color:'#15803d'}}>✿</span>
                  <div>
                    <strong style={{color:'#15803d'}}>Flower Garden:</strong>
                    <span className="ml-2">A relaxing activity where you plant seeds and watch a colorful garden bloom.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl text-lavender mt-1">✿</span>
                  <div>
                    <strong className="text-lavender-dark">Bubble Pop:</strong>
                    <span className="ml-2">Swap and match three bubbles to pop them in this cheerful match-3 game.</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-script font-bold text-peach-dark mb-4">
                Design Philosophy
              </h2>
              <p className="text-lg sm:text-xl leading-relaxed">
                Every element of this app has been designed with accessibility and comfort in mind.
                Large, clear text, soothing color palettes, and straightforward navigation ensure that
                each activity is both enjoyable and easy to use. The app can be installed on any device
                and works offline, providing reliable access whenever needed.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            to="/"
            className="bg-gradient-to-r from-rose via-lavender to-peach text-white font-semibold py-4 px-12 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-xl active:scale-95 hover:scale-105 transform inline-block"
          >
            Back to Activities
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default About;
