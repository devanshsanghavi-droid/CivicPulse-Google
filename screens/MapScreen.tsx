
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';
import { Issue } from '../types';
import { CATEGORIES } from '../constants';

// Declare L for Leaflet global
declare var L: any;

export default function MapScreen() {
  const { setScreen, setSelectedIssueId, user } = useApp();
  const [issues, setIssues] = useState<Issue[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIssues(mockApi.getIssues());
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Map with a default center (Los Altos region)
    const map = L.map(mapContainerRef.current, {
      center: [37.3852, -122.1141],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true,
      markerZoomAnimation: true
    });

    // Add CartoDB Positron Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
      setIsReady(true);
    }, 250);

    // Attempt High-Accuracy Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 18);
        },
        () => console.warn("Location access denied. Using default center."),
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    }

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !isReady || issues.length === 0) return;

    const map = mapInstanceRef.current;
    
    issues.forEach(issue => {
      const category = CATEGORIES.find(c => c.id === issue.categoryId);
      
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="pulse-marker cursor-pointer ${issue.status === 'resolved' ? 'resolved' : ''}"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="p-6">
          <div class="flex items-center gap-2 mb-3">
             <div class="w-2 h-2 rounded-full ${issue.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'}"></div>
             <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">${issue.status}</span>
          </div>
          <div class="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">${category?.name || 'Incident'}</div>
          <h4 class="text-lg font-black text-gray-900 leading-tight mb-2">${issue.title}</h4>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click dot to view full report</p>
        </div>
      `;

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon }).addTo(map);
      
      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -10],
        maxWidth: 280,
        minWidth: 280
      });

      // Navigate to details instantly on marker click
      marker.on('click', () => {
        setSelectedIssueId(issue.id);
        setScreen('issue-detail');
      });
      
      // Also show popup on hover for desktop users
      marker.on('mouseover', function(e: any) {
        this.openPopup();
      });
    });
  }, [issues, isReady, setScreen, setSelectedIssueId]);

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] relative flex flex-col bg-white overflow-hidden">
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 bg-slate-50 z-0" 
      />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-xl border border-gray-100 rounded-full px-6 py-3 flex items-center gap-4 z-[1000] text-[10px] font-black uppercase tracking-[0.15em] text-gray-900 pointer-events-none transition-opacity duration-500">
         <div className="flex items-center gap-2">
           <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] animate-pulse" />
           Live Geospatial Feed
         </div>
      </div>

      <div className="absolute left-6 bottom-10 z-[1000] hidden md:block">
        <div className="bg-white/90 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Incident</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resolved State</span>
          </div>
        </div>
      </div>

      {user && (
        <button 
          onClick={() => setScreen('report')}
          className="absolute right-6 bottom-6 md:bottom-10 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[1000] hover:scale-110 active:scale-95 transition-all shadow-blue-200 border-4 border-white group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}
    </div>
  );
}
