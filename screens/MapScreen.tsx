
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';
import { Issue } from '../types';

export default function MapScreen() {
  const { setScreen, setSelectedIssueId } = useApp();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [view, setView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    setIssues(mockApi.getIssues());
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] relative flex flex-col">
      {/* Mock Map UI since we can't easily embed interactive Leaflet in this sandbox environment without external JS loads being flaky */}
      <div className="flex-1 bg-slate-200 relative overflow-hidden">
        {/* Simplified Map Visualization */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://picsum.photos/1200/800?grayscale')] bg-cover" />
        
        {issues.map(issue => (
          <button 
            key={issue.id}
            onClick={() => {
              setSelectedIssueId(issue.id);
              setScreen('issue-detail');
            }}
            style={{ 
              left: `${(issue.longitude + 122.12) * 5000 % 100}%`, 
              top: `${(issue.latitude - 37.37) * 5000 % 100}%` 
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
          >
            <div className="bg-white border-2 border-blue-600 text-blue-600 font-bold px-2 py-1 rounded-full shadow-lg group-hover:scale-110 transition-transform">
              {issue.upvoteCount}
            </div>
            <div className="w-0.5 h-2 bg-blue-600" />
            
            <div className="hidden group-hover:block absolute bottom-12 w-48 bg-white p-2 rounded-xl shadow-2xl z-50 pointer-events-none">
              <img src={issue.photos[0]?.url} className="w-full h-20 object-cover rounded-lg mb-1" />
              <p className="text-xs font-bold line-clamp-1">{issue.title}</p>
              <p className="text-[10px] text-gray-500">{issue.status}</p>
            </div>
          </button>
        ))}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-xl border rounded-full px-6 py-3 flex items-center gap-4">
           <div className="text-xs font-bold text-gray-500 uppercase">Legend:</div>
           <div className="flex items-center gap-1 text-xs">
             <span className="w-3 h-3 rounded-full bg-red-500" /> Open
           </div>
           <div className="flex items-center gap-1 text-xs">
             <span className="w-3 h-3 rounded-full bg-yellow-500" /> Acknowledged
           </div>
           <div className="flex items-center gap-1 text-xs">
             <span className="w-3 h-3 rounded-full bg-green-500" /> Resolved
           </div>
        </div>

        <button 
          onClick={() => setScreen('report')}
          className="absolute right-6 bottom-24 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold animate-bounce"
        >
          +
        </button>
      </div>
    </div>
  );
}
