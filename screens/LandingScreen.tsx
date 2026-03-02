
import React from 'react';
import { useApp } from '../App';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

export default function LandingScreen() {
  const { setScreen, user } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center transition-colors">
      {/* Hero Section with Container Scroll Animation */}
      <ContainerScroll
        titleComponent={
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
              Los Altos Community Platform
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
              Fix Your City,<br />
              <span className="text-blue-600">Together.</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Report issues, rally your neighbors, and watch problems get resolved.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setScreen('feed')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse Issues
              </button>
              {!user && (
                <button
                  onClick={() => setScreen('login')}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Join CivicPulse
                </button>
              )}
            </div>
          </div>
        }
      >
        {/* Styled preview image */}
        <img
          src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=1400&q=80"
          alt="CivicPulse feed preview"
          className="w-full h-full object-cover object-top rounded-xl"
        />
      </ContainerScroll>

      {/* Features Grid */}
      <section className="py-16 px-6 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Report Issues</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            Snap a photo, pin the location, and submit. It takes less than a minute to inform the city.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28m-2.28 5.941L15.66 7.75" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Prioritize Together</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            Upvote issues that affect you. The most critical concerns naturally rise to the top for attention.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Track Progress</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            Follow reported issues and receive updates when the city acknowledges or resolves them.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 w-full bg-slate-100/50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">150+</div>
            <div className="text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Issues Reported</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">2.5K</div>
            <div className="text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Community Votes</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">89%</div>
            <div className="text-gray-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Resolution Rate</div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">Ready to make a difference?</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-10 max-w-lg mx-auto">Join your neighbors in prioritizing urban infrastructure and building a safer community.</p>
        <button
          onClick={() => setScreen(user ? 'report' : 'login')}
          className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {user ? 'Report Your First Issue' : 'Sign Up to Report Issues'}
        </button>
      </section>
    </div>
  );
}
