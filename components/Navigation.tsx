
import React from 'react';
import { useApp } from '../App';

const NavIcon = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 rounded-lg transition-colors ${
      active ? 'text-blue-600 md:bg-blue-50' : 'text-gray-500 hover:text-gray-900'
    }`}
  >
    <span className="text-xl md:text-base">{icon}</span>
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);

export default function Navigation() {
  const { currentScreen, setScreen, isAdmin, user } = useApp();

  return (
    <nav className="flex justify-around md:justify-end items-center px-2 py-1 md:gap-2">
      <NavIcon icon="📋" label="Feed" active={currentScreen === 'feed'} onClick={() => setScreen('feed')} />
      <NavIcon icon="🗺️" label="Map" active={currentScreen === 'map'} onClick={() => setScreen('map')} />
      <NavIcon icon="➕" label="Report" active={currentScreen === 'report'} onClick={() => setScreen('report')} />
      <NavIcon icon="👤" label="Profile" active={currentScreen === 'profile'} onClick={() => setScreen('profile')} />
      {isAdmin && (
        <NavIcon icon="🛡️" label="Admin" active={currentScreen === 'admin'} onClick={() => setScreen('admin')} />
      )}
      {!user && currentScreen !== 'login' && (
        <button 
          onClick={() => setScreen('login')}
          className="ml-2 text-sm bg-blue-600 text-white px-4 py-1 rounded-full font-medium"
        >
          Login
        </button>
      )}
    </nav>
  );
}
