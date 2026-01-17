
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { CATEGORIES } from '../constants';
import { mockApi } from '../services/mockApi';

export default function ReportScreen() {
  const { user, setScreen, setSelectedIssueId } = useApp();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Attempt to get geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location denied")
      );
    }
  }, []);

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
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    const newIssue = mockApi.createIssue({
      createdBy: user.id,
      creatorName: user.name,
      title,
      description,
      categoryId,
      latitude: location.lat,
      longitude: location.lng,
      address: "Simulated Address near Current Location",
      photos: [{ id: 'p-' + Date.now(), url: photo }]
    });

    setSelectedIssueId(newIssue.id);
    setScreen('issue-detail');
  };

  const Progress = () => (
    <div className="flex gap-1 mb-8">
      {[1, 2, 3].map(i => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-lg mx-auto min-h-[80vh] flex flex-col">
      <h2 className="text-2xl font-bold mb-2">Report an Issue</h2>
      <Progress />

      {step === 1 && (
        <div className="space-y-6 flex-1">
          <div className="text-center">
            <p className="text-gray-500 mb-6">Start by taking a photo of the issue. A clear photo helps city workers understand the situation.</p>
            
            {photo ? (
              <div className="relative rounded-2xl overflow-hidden border">
                <img src={photo} alt="Issue" className="w-full aspect-video object-cover" />
                <button 
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-white/80 backdrop-blur rounded-full p-2 text-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="text-4xl mb-2">📸</span>
                <span className="text-sm font-medium">Click to upload photo</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
          
          <button 
            disabled={!photo}
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 mt-auto"
          >
            Next: Details
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input 
              maxLength={60}
              placeholder="E.g., Large pothole in bicycle lane"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
            <select 
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              rows={4}
              maxLength={500}
              placeholder="Provide more context for city helpers..."
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3 mt-auto">
            <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold">Back</button>
            <button 
              disabled={!title || !categoryId || !description}
              onClick={() => setStep(3)}
              className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              Next: Location
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 flex-1">
          <p className="text-gray-500">Confirm where this issue is located. We've used your GPS coordinates if available.</p>
          
          <div className="h-64 bg-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden border">
             {location ? (
               <div className="text-center">
                 <span className="text-4xl block mb-2">📍</span>
                 <p className="text-xs font-mono text-gray-500">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                 <p className="text-xs mt-2 text-blue-600">Location verified via GPS</p>
               </div>
             ) : (
               <div className="p-8 text-center">
                 <p>Waiting for GPS...</p>
                 <button 
                  onClick={() => setLocation({ lat: 37.3852, lng: -122.1141 })}
                  className="mt-4 text-xs underline text-blue-600"
                >
                  Manual Pin (Demo: Los Altos Center)
                </button>
               </div>
             )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 text-sm text-yellow-800">
            <span>ℹ️</span>
            <p>Your exact location will be shared with City Services to ensure prompt response.</p>
          </div>

          <div className="flex gap-3 mt-auto">
            <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold">Back</button>
            <button 
              disabled={!location || isSubmitting}
              onClick={handleSubmit}
              className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
