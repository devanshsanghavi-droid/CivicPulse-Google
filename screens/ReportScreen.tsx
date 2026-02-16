
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { CATEGORIES } from '../constants';
import { firestoreService } from '../services/firestoreService';

// Declare L for Leaflet global
declare var L: any;

type LocationMode = 'gps' | 'address' | 'pin';

export default function ReportScreen() {
  const { user, setScreen, setSelectedIssueId } = useApp();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [banInfo, setBanInfo] = useState<{ banned: boolean; reason?: string; expiresAt?: string; type?: string } | null>(null);

  // Location mode state
  const [locationMode, setLocationMode] = useState<LocationMode>('gps');
  const [addressInput, setAddressInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  // Map refs
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<any>(null);
  const pinMapContainerRef = useRef<HTMLDivElement>(null);
  const pinMapInstanceRef = useRef<any>(null);
  const pinMarkerRef = useRef<any>(null);

  // GPS location (stored separately so we can offer it as a choice)
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null);

  // Check ban status
  useEffect(() => {
    if (user) {
      firestoreService.checkBanStatus(user.id).then(setBanInfo).catch(() => {});
    }
  }, [user]);

  // Get GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsLocation(loc);
          // Default to GPS location
          setLocation(loc);
        },
        () => console.log("Location denied"),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Initialize read-only mini-map for GPS mode on step 3
  useEffect(() => {
    if (step === 3 && locationMode === 'gps' && miniMapContainerRef.current && location && !miniMapInstanceRef.current) {
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
      setTimeout(() => map.invalidateSize(), 100);
    }

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [step, location, locationMode]);

  // Initialize interactive pin-drop map
  useEffect(() => {
    if (step === 3 && locationMode === 'pin' && pinMapContainerRef.current && !pinMapInstanceRef.current) {
      const center = gpsLocation || { lat: 37.3852, lng: -122.1141 };
      const map = L.map(pinMapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Place initial marker
      const marker = L.marker([center.lat, center.lng], { icon: pinIcon, draggable: true }).addTo(map);
      pinMarkerRef.current = marker;
      setLocation({ lat: center.lat, lng: center.lng });

      // Update location on marker drag
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setLocation({ lat: pos.lat, lng: pos.lng });
        setResolvedAddress(null);
        // Reverse geocode the dropped pin
        reverseGeocode(pos.lat, pos.lng);
      });

      // Click map to move pin
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        setResolvedAddress(null);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      pinMapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
    }

    return () => {
      if (pinMapInstanceRef.current) {
        pinMapInstanceRef.current.remove();
        pinMapInstanceRef.current = null;
        pinMarkerRef.current = null;
      }
    };
  }, [step, locationMode]);

  // Cleanup maps when location mode changes
  useEffect(() => {
    if (locationMode === 'gps') {
      // Restore GPS location
      if (gpsLocation) setLocation(gpsLocation);
      setResolvedAddress(null);
      setGeocodeError(null);
    } else if (locationMode === 'address') {
      // Reset until user searches
      setLocation(null);
      setResolvedAddress(null);
      setGeocodeError(null);
    }
    // Cleanup maps when switching modes
    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove();
      miniMapInstanceRef.current = null;
    }
    if (pinMapInstanceRef.current) {
      pinMapInstanceRef.current.remove();
      pinMapInstanceRef.current = null;
      pinMarkerRef.current = null;
    }
  }, [locationMode]);

  // If user is banned, show a message instead of the report form
  // (Placed after all hooks to respect React Rules of Hooks)
  if (banInfo?.banned) {
    return (
      <div className="p-8 max-w-xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Account Restricted</h2>
        <p className="text-sm text-gray-500 mb-4 max-w-sm leading-relaxed">
          Your account has been {banInfo.type === 'permanent' ? 'permanently' : 'temporarily'} restricted from posting.
        </p>
        {banInfo.reason && (
          <p className="text-xs text-gray-400 mb-2">Reason: {banInfo.reason}</p>
        )}
        {banInfo.expiresAt && (
          <p className="text-xs text-gray-400 mb-6">
            Restriction expires: {new Date(banInfo.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        <button onClick={() => setScreen('feed')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-full hover:bg-blue-100 transition-colors">
          Return to Feed
        </button>
      </div>
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data.display_name) {
        setResolvedAddress(data.display_name);
      }
    } catch {
      // Silent fail for reverse geocode
    }
  };

  const handleGeocodeAddress = async () => {
    if (!addressInput.trim()) return;
    setIsGeocoding(true);
    setGeocodeError(null);
    setResolvedAddress(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput.trim())}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setLocation({ lat, lng });
        setResolvedAddress(data[0].display_name);
        setGeocodeError(null);
      } else {
        setGeocodeError('Address not found. Try being more specific.');
        setLocation(null);
      }
    } catch {
      setGeocodeError('Failed to look up address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !location) return;
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      let photoUrl: string | null = null;
      
      // Upload photo if provided
      if (photoFile) {
        photoUrl = await firestoreService.uploadPhoto(photoFile);
      }
      
      // Create issue in Firestore
      const newIssue = await firestoreService.createIssue({
        createdBy: user.id,
        creatorName: user.name,
        creatorPhotoURL: user.photoURL || '',
        title,
        description,
        categoryId,
        latitude: location.lat,
        longitude: location.lng,
        address: resolvedAddress || "Verified Community Location",
        photos: photoUrl ? [{ id: 'p-' + Date.now(), url: photoUrl }] : []
      });

      setSelectedIssueId(newIssue.id);
      setScreen('issue-detail');
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setSubmitError(err.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
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

      {/* ─── STEP 1: Photo (Optional) ─────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-8 flex-1 flex flex-col">
          <div className="text-left">
            <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-blue-600">Visual Evidence</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">High-fidelity imagery significantly expedites city resolution times. You can also skip this step if a photo isn't available.</p>
            
            {photo ? (
              <div className="relative rounded-3xl overflow-hidden border-2 border-blue-50 group">
                <img src={photo} alt="Issue Capture" className="w-full aspect-[16/10] object-cover" />
                <button 
                  onClick={() => { setPhoto(null); setPhotoFile(null); }}
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
          
          <div className="mt-auto space-y-3">
            <button 
              onClick={() => setStep(2)}
              className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 transition-colors ${
                photo 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {photo ? 'Advance to Details' : 'Continue Without Photo'}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Details ──────────────────────────────────────── */}
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

      {/* ─── STEP 3: Location ─────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6 flex-1 flex flex-col">
          <div className="text-left">
            <h3 className="font-black text-sm uppercase tracking-widest mb-2 text-blue-600">Incident Location</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">Where did this issue occur? Choose a method below.</p>
          </div>

          {/* Location Mode Selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            {([
              { key: 'gps' as const, label: 'My Location', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              )},
              { key: 'address' as const, label: 'Address', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              )},
              { key: 'pin' as const, label: 'Pin Drop', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              )}
            ]).map(m => (
              <button
                key={m.key}
                onClick={() => setLocationMode(m.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  locationMode === m.key 
                    ? 'bg-white shadow-sm text-blue-600 border border-gray-100' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* GPS Mode */}
          {locationMode === 'gps' && (
            <div>
              <div 
                ref={miniMapContainerRef}
                className="h-56 bg-gray-50 rounded-3xl relative overflow-hidden border border-gray-100 shadow-inner"
              >
                {!location && (
                  <div className="absolute inset-0 p-8 text-center flex flex-col items-center justify-center bg-white/80 z-10">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Acquiring GPS signal...</p>
                    <p className="text-[10px] text-gray-400 mt-2">If this takes too long, try "Address" or "Pin Drop"</p>
                  </div>
                )}
              </div>
              {location && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[10px] font-black tracking-tighter text-gray-400 uppercase">{location.lat.toFixed(6)} N, {location.lng.toFixed(6)} W</p>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    Location Verified
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Address Mode */}
          {locationMode === 'address' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addressInput}
                  onChange={e => setAddressInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGeocodeAddress()}
                  placeholder="Enter street address, intersection, or landmark..."
                  className="flex-1 px-4 py-3.5 border border-gray-100 bg-gray-50 rounded-xl focus:bg-white focus:border-blue-400 outline-none transition-all text-sm font-medium"
                />
                <button
                  onClick={handleGeocodeAddress}
                  disabled={!addressInput.trim() || isGeocoding}
                  className="px-5 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest disabled:opacity-50 hover:bg-blue-700 transition-colors flex-shrink-0"
                >
                  {isGeocoding ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Find'}
                </button>
              </div>
              
              {geocodeError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                  {geocodeError}
                </div>
              )}

              {resolvedAddress && location && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Location Found</span>
                  </div>
                  <p className="text-xs text-green-800 font-medium leading-relaxed">{resolvedAddress}</p>
                  <p className="text-[10px] font-black tracking-tighter text-green-600/60 uppercase">{location.lat.toFixed(6)} N, {location.lng.toFixed(6)} W</p>
                </div>
              )}
            </div>
          )}

          {/* Pin Drop Mode */}
          {locationMode === 'pin' && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tap the map or drag the pin to the exact location</p>
              <div 
                ref={pinMapContainerRef}
                className="h-64 bg-gray-50 rounded-3xl relative overflow-hidden border border-gray-100 shadow-inner"
              />
              {location && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black tracking-tighter text-gray-400 uppercase">{location.lat.toFixed(6)} N, {location.lng.toFixed(6)} W</p>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      Pin Placed
                    </p>
                  </div>
                  {resolvedAddress && (
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed truncate">{resolvedAddress}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3 text-xs font-medium text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <p className="leading-relaxed">Location data is used for routing municipal service crews and remains confidential within city operations.</p>
          </div>

          {submitError && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100">
              {submitError}
            </div>
          )}

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
              {isSubmitting ? 'Uploading & Saving...' : 'Transmit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
