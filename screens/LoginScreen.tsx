
import React, { useState } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';
import { UserRole } from '../types';

export default function LoginScreen() {
  const { setUser, setScreen } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = mockApi.login(email, password, role);
    if (user) {
      setUser(user);
      setScreen('feed');
    } else {
      setError('Invalid credentials for this specific email.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-6 max-w-sm mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-blue-600 mb-2">CivicPulse</h1>
        <p className="text-gray-500">Empower your neighborhood. Report issues. Drive change.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
          <input 
            type="email" 
            placeholder="you@example.com"
            className="w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={email === 'notdev42@gmail.com'}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Role (Generic Login)</label>
          <select 
            className="w-full px-4 py-4 border rounded-2xl bg-white outline-none"
            value={role}
            onChange={e => setRole(e.target.value as UserRole)}
            disabled={email === 'notdev42@gmail.com'}
          >
            <option value="resident">Resident</option>
            <option value="admin">City Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          {email === 'notdev42@gmail.com' && (
            <p className="text-[10px] text-blue-600 mt-1">Super Admin credentials detected.</p>
          )}
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Sign In
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-400">By continuing, you agree to CivicPulse's <span className="underline">Terms of Service</span>.</p>
      </div>

      <button 
        onClick={() => setScreen('feed')}
        className="mt-6 text-blue-600 font-bold text-sm"
      >
        Continue as Guest
      </button>
    </div>
  );
}
