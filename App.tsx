
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Issue, UserRole, Notification } from './types';
import { mockApi } from './services/mockApi';
import LandingScreen from './screens/LandingScreen';
import FeedScreen from './screens/FeedScreen';
import MapScreen from './screens/MapScreen';
import ReportScreen from './screens/ReportScreen';
import ProfileScreen from './screens/ProfileScreen';
import IssueDetailScreen from './screens/IssueDetailScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import LoginScreen from './screens/LoginScreen';
import LocationExplanationScreen from './screens/LocationExplanationScreen';
import Navigation from './components/Navigation';

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  currentScreen: string;
  setScreen: (s: string) => void;
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isAdmin: boolean;
  notifs: Notification[];
  refreshNotifs: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(mockApi.getCurrentUser());
  const [currentScreen, setScreen] = useState('landing');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [locationExplained, setLocationExplained] = useState(false);
  const [pendingScreen, setPendingScreen] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const refreshNotifs = () => {
    if (user) {
      setNotifs(mockApi.getNotifications(user.id));
    }
  };

  useEffect(() => {
    refreshNotifs();
    const interval = setInterval(refreshNotifs, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleScreenChange = (screen: string) => {
    if ((screen === 'map' || screen === 'report') && !locationExplained) {
      setPendingScreen(screen);
      setScreen('location-explanation');
    } else {
      setScreen(screen);
    }
  };

  const renderScreen = () => {
    if (currentScreen === 'login') return <LoginScreen />;
    if (currentScreen === 'location-explanation') {
      return (
        <LocationExplanationScreen 
          onConfirm={() => {
            setLocationExplained(true);
            setScreen(pendingScreen || 'feed');
            setPendingScreen(null);
          }}
          onCancel={() => {
            setLocationExplained(true); // User acknowledged even if denied
            setScreen(pendingScreen || 'feed');
            setPendingScreen(null);
          }}
        />
      );
    }

    if (['report', 'profile', 'admin'].includes(currentScreen) && !user) return <LoginScreen />;

    switch (currentScreen) {
      case 'landing': return <LandingScreen />;
      case 'feed': return <FeedScreen />;
      case 'map': return <MapScreen />;
      case 'report': return <ReportScreen />;
      case 'profile': return <ProfileScreen />;
      case 'issue-detail': return <IssueDetailScreen id={selectedIssueId!} />;
      case 'admin': return isAdmin ? <AdminDashboardScreen /> : <FeedScreen />;
      default: return <LandingScreen />;
    }
  };

  const handleLogoClick = () => {
    setSelectedIssueId(null);
    setScreen('landing');
  };

  const handleNotifClick = (n: Notification) => {
    setSelectedIssueId(n.issueId);
    setScreen('issue-detail');
    setShowNotifs(false);
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  const NotificationBell = () => (
    <div className="relative">
      <button 
        onClick={() => {
          setShowNotifs(!showNotifs);
          if (!showNotifs && user) {
            mockApi.markNotificationsRead(user.id);
            refreshNotifs();
          }
        }}
        className="p-2 text-gray-500 hover:text-blue-600 transition-colors relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full"></span>
        )}
      </button>

      {showNotifs && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Activity Center</span>
            <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notifs.length > 0 ? (
              notifs.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleNotifClick(n)}
                  className={`p-4 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'status_change' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight mb-1">{n.title}</h4>
                      <p className="text-[11px] text-gray-500 leading-snug">{n.message}</p>
                      <span className="text-[9px] font-bold text-gray-300 uppercase mt-2 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">All quiet for now</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppContext.Provider value={{ 
      user, setUser, currentScreen, setScreen: handleScreenChange, 
      selectedIssueId, setSelectedIssueId, isAdmin,
      notifs, refreshNotifs
    }}>
      <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pt-16">
        {currentScreen !== 'landing' && currentScreen !== 'login' && currentScreen !== 'location-explanation' && (
          <>
            <header className="fixed top-0 left-0 right-0 bg-white border-b z-40 md:hidden px-4 py-2.5 flex justify-between items-center">
              <button onClick={handleLogoClick} className="text-lg font-bold text-blue-600">CivicPulse</button>
              <div className="flex items-center gap-2">
                {user && <NotificationBell />}
                {!user && (
                  <button onClick={() => handleScreenChange('login')} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">Sign In</button>
                )}
              </div>
            </header>

            <header className="fixed top-0 left-0 right-0 bg-white border-b z-40 hidden md:block px-4 py-3">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <button onClick={handleLogoClick} className="text-xl font-bold text-blue-600">CivicPulse</button>
                  {user && <NotificationBell />}
                </div>
                <Navigation />
              </div>
            </header>
          </>
        )}

        <main className={`flex-1 w-full ${currentScreen !== 'landing' && currentScreen !== 'login' && currentScreen !== 'location-explanation' ? 'max-w-4xl mx-auto mt-14 md:mt-0' : ''}`}>
          {renderScreen()}
        </main>

        {currentScreen !== 'landing' && currentScreen !== 'login' && currentScreen !== 'location-explanation' && (
          <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 md:hidden">
            <Navigation />
          </footer>
        )}
      </div>
    </AppContext.Provider>
  );
}
