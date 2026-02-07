
import React, { useState } from 'react';
import { useApp } from '../App';
import { signInWithGoogle } from '../services/firebaseAuth';

export default function LoginScreen() {
  const { setUser, setScreen } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await signInWithGoogle();
      setUser(user);
      setScreen('feed');
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10 inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-[2.5rem] shadow-2xl shadow-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6.203c-.099.32-.155.657-.155 1.008 0 5.488 3.99 10.06 9.33 10.815a11.963 11.963 0 0 0 9.33-10.815c0-.351-.056-.688-.155-1.008a11.959 11.959 0 0 1-8.402-4.239Z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">CivicPulse</h1>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-12">Authorized Personnel Only</p>

        <div className="bg-white border-2 border-gray-100 rounded-[3rem] p-10 shadow-2xl shadow-gray-100/50 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-2">Resident SSO</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-10">Verified Identity Required</p>
          
          <div className="flex flex-col items-center justify-center min-h-[50px] mb-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-200 rounded-full px-6 py-3 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl border border-red-100 leading-relaxed">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-center gap-3 text-left">
           <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
             Environment: {window.location.hostname}
           </p>
        </div>
        
        <button 
          onClick={() => setScreen('landing')}
          className="mt-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors"
        >
          Return to Hub
        </button>
      </div>
    </div>
  );
}
