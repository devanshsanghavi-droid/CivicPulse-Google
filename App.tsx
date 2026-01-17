
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Issue, UserRole } from './types';
import { mockApi } from './services/mockApi';
import FeedScreen from './screens/FeedScreen';
import MapScreen from './screens/MapScreen';
import ReportScreen from './screens/ReportScreen';
import ProfileScreen from './screens/ProfileScreen';
import IssueDetailScreen from './screens/IssueDetailScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import LoginScreen from './screens/LoginScreen';
import Navigation from './components/Navigation';

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  currentScreen: string;
  setScreen: (s: string) => void;
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(mockApi.getCurrentUser());
  const [currentScreen, setScreen] = useState('feed');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Basic routing handler
  const renderScreen = () => {
    if (currentScreen === 'login') return <LoginScreen />;
    
    // Auth guard for protected routes
    if (['report', 'profile', 'admin'].includes(currentScreen) && !user) {
      return <LoginScreen />;
    }

    switch (currentScreen) {
      case 'feed': return <FeedScreen />;
      case 'map': return <MapScreen />;
      case 'report': return <ReportScreen />;
      case 'profile': return <ProfileScreen />;
      case 'issue-detail': return <IssueDetailScreen id={selectedIssueId!} />;
      case 'admin': return isAdmin ? <AdminDashboardScreen /> : <FeedScreen />;
      default: return <FeedScreen />;
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, currentScreen, setScreen, 
      selectedIssueId, setSelectedIssueId, isAdmin 
    }}>
      <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pt-16">
        <header className="fixed top-0 left-0 right-0 bg-white border-b z-40 hidden md:block px-4 py-3">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-1 rounded">CP</span> CivicPulse
            </h1>
            <Navigation />
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full">
          {renderScreen()}
        </main>

        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 md:hidden">
          <Navigation />
        </footer>
      </div>
    </AppContext.Provider>
  );
}
