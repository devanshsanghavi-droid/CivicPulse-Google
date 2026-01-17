
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
    const map = L.map(mapContainerRef.current).setView([37.3852, -122.1141], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
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
        <div class="font-bold text-sm mb-1">${issue.title}</div>
        <div class="text-xs text-gray-500 mb-2">${issue.status}</div>
        <button class="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-bold w-full">View Details</button>
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
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] relative flex flex-col">
      <div ref={mapContainerRef} className="flex-1 w-full bg-slate-200 z-0" />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-xl border rounded-full px-6 py-2 flex items-center gap-4 z-[1000] text-[10px] md:text-xs">
         <div className="font-bold text-gray-400 uppercase">Legend:</div>
         <div className="flex items-center gap-1">
           <span className="w-2 h-2 rounded-full bg-blue-500" /> Issues
         </div>
      </div>

      <button 
        onClick={() => setScreen('report')}
        className="absolute right-6 bottom-6 md:bottom-12 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-bold z-[1000] hover:scale-110 transition-transform active:scale-95"
      >
        +
      </button>
    </div>
  );
}
