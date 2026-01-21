
import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';

export default function ProfileScreen() {
  const { user, setUser, setScreen } = useApp();
  const [stats, setStats] = useState({ reportCount: 0, upvoteCount: 0 });
  const [showRegistry, setShowRegistry] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'registry'>('settings');

  useEffect(() => {
    if (user) {
      setStats(mockApi.getUserStats(user.id));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-gray-200 mb-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
        <p className="mb-6 text-gray-500 font-bold uppercase text-xs tracking-widest">Authentication Required</p>
        <button onClick={() => setScreen('login')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100">Sign In</button>
      </div>
    );
  }

  const handleLogout = () => {
    mockApi.logout();
    setUser(null);
    setScreen('landing');
  };

  const toggleNotifs = () => {
    const updated = mockApi.updateProfile(user.id, { notifsEnabled: !user.notifsEnabled });
    if (updated) setUser(updated);
  };

  const updateNeighborhood = (val: string) => {
    const updated = mockApi.updateProfile(user.id, { neighborhood: val });
    if (updated) setUser(updated);
    setShowRegistry(false);
  };

  return (
    <div className="p-8 space-y-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">{user.name}</h2>
          <p className="text-gray-400 font-bold text-sm tracking-tight mb-3">{user.email}</p>
          <div className="flex gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              {user.role}
            </span>
            {user.neighborhood && (
              <span className="text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                {user.neighborhood}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Activity Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-sm">
            <div className="text-3xl font-black text-blue-600 mb-1 tracking-tight">{stats.reportCount}</div>
            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Reports Lodged</div>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-sm">
            <div className="text-3xl font-black text-green-600 mb-1 tracking-tight">{stats.upvoteCount}</div>
            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Collective Votes</div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Account Control</h3>
        <div className="grid gap-3">
          {/* Notif Toggler */}
          <div className="w-full p-5 bg-white border border-gray-100 rounded-2xl flex justify-between items-center group transition-all">
            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span className="text-sm font-bold text-gray-700">Notification Preferences</span>
            </div>
            <button 
              onClick={toggleNotifs}
              className={`w-12 h-6 rounded-full transition-colors relative ${user.notifsEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.notifsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* Registry Button */}
          <button 
            onClick={() => setShowRegistry(!showRegistry)}
            className="w-full text-left p-5 bg-white border border-gray-100 rounded-2xl flex justify-between items-center group transition-all hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-sm font-bold text-gray-700">Neighborhood Registry</span>
            </div>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">{user.neighborhood || 'Select'}</span>
          </button>

          {showRegistry && (
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">Choose Primary District</p>
               <div className="grid grid-cols-2 gap-2">
                 {['Downtown', 'Highlands', 'Westside', 'Lakeshore', 'Old Town', 'Creekview'].map(d => (
                   <button 
                    key={d}
                    onClick={() => updateNeighborhood(d)}
                    className={`p-3 text-xs font-bold rounded-xl border transition-all ${user.neighborhood === d ? 'bg-blue-600 text-white border-blue-700' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-300'}`}
                   >
                     {d}
                   </button>
                 ))}
               </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="w-full text-left p-5 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex justify-between items-center group hover:bg-red-100 transition-colors mt-8"
          >
            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <span className="text-sm font-black uppercase tracking-widest">Terminate Session</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
