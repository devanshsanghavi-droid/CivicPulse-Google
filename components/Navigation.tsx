
import React from 'react';
import { useApp } from '../App';

const Icons = {
  Feed: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Map: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446 4.875-2.437a.75.75 0 0 0 .372-.665V4.77a.75.75 0 0 0-.993-.71l-5.383 2.154a.75.75 0 0 1-.54 0L8.458 4.062a.75.75 0 0 0-.54 0L2.535 6.062a.75.75 0 0 0-.41.665v11.73a.75.75 0 0 0 .993.71l5.383-2.154a.75.75 0 0 1 .54 0l3.912 1.565a.75.75 0 0 0 .54 0Z" />
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Admin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6.203c-.099.32-.155.657-.155 1.008 0 5.488 3.99 10.06 9.33 10.815a11.963 11.963 0 0 0 9.33-10.815c0-.351-.056-.688-.155-1.008a11.959 11.959 0 0 1-8.402-4.239Z" />
    </svg>
  )
};

const NavIcon = ({ Icon, label, active, onClick }: { Icon: React.FC, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 rounded-lg transition-colors ${
      active ? 'text-blue-600 md:bg-blue-50' : 'text-gray-500 hover:text-gray-900'
    }`}
  >
    <Icon />
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);

export default function Navigation() {
  const { currentScreen, setScreen, isAdmin, user } = useApp();

  return (
    <nav className="flex justify-around md:justify-end items-center px-2 py-1 md:gap-2">
      <NavIcon Icon={Icons.Feed} label="Feed" active={currentScreen === 'feed'} onClick={() => setScreen('feed')} />
      <NavIcon Icon={Icons.Map} label="Map" active={currentScreen === 'map'} onClick={() => setScreen('map')} />
      
      {/* Hide Report for non-logged in users */}
      {user && (
        <NavIcon Icon={Icons.Plus} label="Report" active={currentScreen === 'report'} onClick={() => setScreen('report')} />
      )}
      
      <NavIcon Icon={Icons.User} label="Profile" active={currentScreen === 'profile'} onClick={() => setScreen('profile')} />
      
      {isAdmin && (
        <NavIcon Icon={Icons.Admin} label="Admin" active={currentScreen === 'admin'} onClick={() => setScreen('admin')} />
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
