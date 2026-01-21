
import React from 'react';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LocationExplanationScreen({ onConfirm, onCancel }: Props) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-blue-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </div>

      <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">Geospatial Awareness</h2>
      <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm">
        To effectively coordinate with city maintenance crews, we require access to your device's location.
      </p>

      <div className="w-full space-y-4 mb-12">
        <div className="flex items-start gap-4 text-left p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
            <span className="text-xs font-black">01</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Pinpoint Accuracy</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Ensures city crews find the exact pothole or streetlight without guesswork.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 text-left p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
            <span className="text-xs font-black">02</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Contextual Feed</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Prioritizes reports in your immediate vicinity on your activity feed.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onConfirm}
        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mb-4"
      >
        Enable Location Services
      </button>
      
      <button 
        onClick={onCancel}
        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
      >
        Proceed without location
      </button>
    </div>
  );
}
