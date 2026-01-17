
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';
import { Issue } from '../types';

declare const L: any;

export default function MapScreen() {
  const { setScreen, setSelectedIssueId } = useApp();
  const [issues, setIssues] = useState<Issue[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const data = mockApi.getIssues();
    setIssues(data);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize map
    // Centered on Los Altos area roughly
    const map = L.map(mapContainerRef.current, {
      zoomControl: false // Move zoom control later if needed
    }).setView([37.3852, -122.1141], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Fix for "grey screen" - invalidate size after component mount/render
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || issues.length === 0) return;

    const map = mapInstanceRef.current;

    // Clear existing markers if any (though here we just init)
    issues.forEach(issue => {
      const marker = L.marker([issue.latitude, issue.longitude]).addTo(map);
      
      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 min-w-[150px]';
      popupContent.innerHTML = `
        <div class="font-bold text-sm mb-1 text-gray-900">${issue.title}</div>
        <div class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">${issue.status}</div>
        <button class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest w-full shadow-sm hover:bg-blue-700 transition-colors">Details</button>
      `;

      const btn = popupContent.querySelector('button');
      btn?.addEventListener('click', () => {
        setSelectedIssueId(issue.id);
        setScreen('issue-detail');
      });

      marker.bindPopup(popupContent);
    });
  }, [issues, setScreen, setSelectedIssueId]);

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] relative flex flex-col bg-slate-100">
      <div 
        ref={mapContainerRef} 
        className="flex-1 w-full bg-slate-200 z-0 border-b border-gray-100" 
        style={{ minHeight: '300px' }} 
      />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-xl border border-gray-100 rounded-full px-5 py-2 flex items-center gap-4 z-[1000] text-[10px] font-black uppercase tracking-widest">
         <div className="text-gray-400">Map Index:</div>
         <div className="flex items-center gap-1.5">
           <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" /> Registered Incident
         </div>
      </div>

      <button 
        onClick={() => setScreen('report')}
        className="absolute right-6 bottom-6 md:bottom-10 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold z-[1000] hover:scale-110 active:scale-95 transition-all shadow-blue-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
