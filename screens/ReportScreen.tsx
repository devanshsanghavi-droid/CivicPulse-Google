
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { CATEGORIES } from '../constants';
import { mockApi } from '../services/mockApi';

// Declare L for Leaflet global
declare var L: any;

export default function ReportScreen() {
  const { user, setScreen, setSelectedIssueId } = useApp();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location denied"),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Initialize mini-map when step 3 is reached
  useEffect(() => {
    if (step === 3 && miniMapContainerRef.current && location && !miniMapInstanceRef.current) {
      const map = L.map(miniMapContainerRef.current, {
        center: [location.lat, location.lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        touchZoom: false,
        doubleClickZoom: false,
        dragging: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="pulse-marker"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);
      miniMapInstanceRef.current = map;
      
      // Force redraw
      setTimeout(() => map.invalidateSize(), 100);
    }

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [step, location]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !location || !photo) return;
    setIsSubmitting(true);
    
    await new Promise(r => setTimeout(r, 1500));
    
    const newIssue = mockApi.createIssue({
      createdBy: user.id,
      creatorName: user.name,
      title,
      description,
      categoryId,
      latitude: location.lat,
      longitude: location.lng,
      address: "Verified Community Location",
      photos: [{ id: 'p-' + Date.now(), url: photo }]
    });

    setSelectedIssueId(newIssue.id);
    setScreen('issue-detail');
  };

  const Progress = () => (
    <div className="flex gap-2 mb-10">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-blue-600' : 'bg-gray-100'}`} />
      ))}
    </div>
  );

  return (
    <div className="p-8 max-w-xl mx-auto min-h-[85vh] flex flex-col bg-white md:border md:border-gray-100 md:rounded-[2.5rem] md:my-8 md:shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black tracking-tight text-gray-900">Log Incident</h2>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {step} of 3</span>
      </div>
      <Progress />

      {step === 1 && (
        <div className="space-y-8 flex-1 flex flex-col">
          <div className="text-left">
            <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-blue-600">Visual Evidence</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">High-fidelity imagery significantly expedites city resolution times. Please capture the issue clearly.</p>
            
            {photo ? (
              <div className="relative rounded-3xl overflow-hidden border-2 border-blue-50 group">
                <img src={photo} alt="Issue Capture" className="w-full aspect-[16/10] object-cover" />
                <button 
                  onClick={() => setPhoto(null)}
                  className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-2.5 shadow-xl hover:bg-red-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[16/10] border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-4 group-hover:text-blue-500 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a48.323 48.323 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">Import Evidence Capture</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
          
          <button 
            disabled={!photo}
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 mt-auto shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors"
          >
            Advance to Details
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 flex-1 flex flex-col">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject Header</label>
              <input 
                maxLength={60}
                placeholder="Briefly describe the incident..."
                className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Classify Issue</label>
              <select 
                className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-sm cursor-pointer"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Select Classification...</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Extended Context</label>
              <textarea 
                rows={5}
                maxLength={500}
                placeholder="Provide specific details for municipal response teams..."
                className="w-full px-5 py-4 border border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:border-blue-400 outline-none transition-all font-medium text-sm leading-relaxed"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button 
              onClick={() => setStep(1)} 
              className="flex-1 border border-gray-200 py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button 
              disabled={!title || !categoryId || !description}
              onClick={() => setStep(3)}
              className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors"
            >
              Locate Incident
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 flex-1 flex flex-col">
          <div className="text-left">
            <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-blue-600">Geospatial Confirmation</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">Confirm the exact location of the incident for efficient routing of city resources.</p>
            
            <div 
              ref={miniMapContainerRef}
              className="h-64 bg-gray-50 rounded-3xl relative overflow-hidden border border-gray-100 shadow-inner"
            >
               {!location && (
                 <div className="absolute inset-0 p-8 text-center flex flex-col items-center justify-center bg-white/80 z-10">
                   <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <p className="text-xs font-black uppercase tracking-widest text-gray-400">Awaiting Signal Synchronization...</p>
                   <button 
                    onClick={() => setLocation({ lat: 37.3852, lng: -122.1141 })}
                    className="mt-6 text-[10px] font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-600"
                  >
                    Manual Override (Regional Center)
                  </button>
                 </div>
               )}
            </div>
            {location && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px] font-black tracking-tighter text-gray-400 uppercase">{location.lat.toFixed(6)} N, {location.lng.toFixed(6)} W</p>
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                   Location Verified
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-4 text-xs font-medium text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-400 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <p className="leading-relaxed">Telemetry data is strictly utilized for routing municipal service crews and remains confidential within city operations.</p>
          </div>

          <div className="flex gap-4 mt-auto">
            <button 
              onClick={() => setStep(2)} 
              className="flex-1 border border-gray-200 py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button 
              disabled={!location || isSubmitting}
              onClick={handleSubmit}
              className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? 'Processing Submission...' : 'Transmit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
