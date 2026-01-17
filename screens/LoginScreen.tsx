
import React, { useState } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';

export default function LoginScreen() {
  const { setUser, setScreen } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = mockApi.login(email, password);
    if (user) {
      setUser(user);
      setScreen('feed');
    } else {
      setError('Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-screen md:min-h-[80vh] flex flex-col justify-center px-6 max-w-sm mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black text-blue-600 mb-3 tracking-tighter">CivicPulse</h1>
        <p className="text-gray-500 font-medium">Access your community portal to report and track city issues.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in duration-300">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
          <input 
            type="email" 
            placeholder="name@example.com"
            className="w-full px-5 py-4 border-2 border-gray-100 bg-white rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 shadow-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full px-5 py-4 border-2 border-gray-100 bg-white rounded-2xl text-gray-900 font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all placeholder:text-gray-300 shadow-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {email === 'notdev42@gmail.com' && (
            <div className="flex items-center justify-center gap-2 mt-3 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6.203c-.099.32-.155.657-.155 1.008 0 5.488 3.99 10.06 9.33 10.815a11.963 11.963 0 0 0 9.33-10.815c0-.351-.056-.688-.155-1.008a11.959 11.959 0 0 1-8.402-4.239Z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Administrative Mode Enabled</span>
            </div>
          )}
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Sign In
        </button>
      </form>

      <div className="mt-10 flex flex-col items-center gap-4">
        <button 
          onClick={() => setScreen('feed')}
          className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-blue-600 transition-colors flex items-center gap-2"
        >
          Skip for now
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
