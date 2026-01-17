
import React from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';

export default function ProfileScreen() {
  const { user, setUser, setScreen, setSelectedIssueId } = useApp();

  if (!user) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-gray-500">Log in to view your profile and tracked issues.</p>
        <button onClick={() => setScreen('login')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Login</button>
      </div>
    );
  }

  const handleLogout = () => {
    mockApi.logout();
    setUser(null);
    setScreen('feed');
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-3xl">👤</div>
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Account Settings</h3>
        <div className="grid gap-2">
          <button className="w-full text-left p-4 bg-white border rounded-xl flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <span>🔔</span>
              <span className="text-sm font-medium">Notification Preferences</span>
            </div>
            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button className="w-full text-left p-4 bg-white border rounded-xl flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <span>🏠</span>
              <span className="text-sm font-medium">Neighborhood: Los Altos North</span>
            </div>
            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex justify-between items-center group"
          >
            <div className="flex items-center gap-3">
              <span>🚪</span>
              <span className="text-sm font-medium">Log Out</span>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Your Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-xs text-gray-400 uppercase font-bold">Issues Reported</div>
          </div>
          <div className="bg-white border p-4 rounded-2xl text-center">
            <div className="text-2xl font-bold text-green-600">42</div>
            <div className="text-xs text-gray-400 uppercase font-bold">Upvotes Given</div>
          </div>
        </div>
      </div>
    </div>
  );
}
