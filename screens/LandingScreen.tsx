
import React from 'react';
import { useApp } from '../App';

export default function LandingScreen() {
  const { setScreen, user } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100 mb-8 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6.203c-.099.32-.155.657-.155 1.008 0 5.488 3.99 10.06 9.33 10.815a11.963 11.963 0 0 0 9.33-10.815c0-.351-.056-.688-.155-1.008a11.959 11.959 0 0 1-8.402-4.239Z" />
          </svg>
          Community-Powered City Improvement
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black text-blue-600 mb-6 tracking-tight">
          CivicPulse
        </h1>
        
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Report issues in your city. Upvote what matters.<br className="hidden md:block" />
          Make your community better, together.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => setScreen('feed')}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 group"
          >
            Browse Issues
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
          {!user && (
            <button 
              onClick={() => setScreen('login')}
              className="flex items-center gap-2 text-gray-600 font-bold px-8 py-4 hover:text-blue-600 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
               Sign In / Join
            </button>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Report Issues</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Snap a photo, pin the location, and submit. It takes less than a minute to inform the city.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28m-2.28 5.941L15.66 7.75" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Prioritize Together</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Upvote issues that affect you. The most critical concerns naturally rise to the top for attention.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">Track Progress</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Follow reported issues and receive updates when the city acknowledges or resolves them.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 w-full bg-slate-100/50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">150+</div>
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Issues Reported</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">2.5K</div>
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Community Votes</div>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600 mb-1">89%</div>
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Resolution Rate</div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-4 text-gray-900 tracking-tight">Ready to make a difference?</h2>
        <p className="text-gray-500 mb-10 max-w-lg mx-auto">Join your neighbors in prioritizing urban infrastructure and building a safer community.</p>
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
