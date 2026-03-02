
import React, { useState } from 'react';
import { useApp } from '../App';
import { signInWithGoogle } from '../services/firebaseAuth';
import { AnimatedBlobBackground } from '../components/ui/animated-blob-background';
import { Spotlight } from '../components/ui/spotlight';

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
    <div className="min-h-screen bg-black flex relative overflow-hidden">

      {/* Full-page blob background (subtle base layer) */}
      <AnimatedBlobBackground className="z-0" />

      {/* Left side — login form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 relative z-10">
        <Spotlight className="-top-40 left-0 md:-top-20" fill="#3b82f6" />

        <div className="max-w-md w-full mx-auto">
          {/* CivicPulse logo/wordmark */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Civic<span className="text-blue-500">Pulse</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">Los Altos Community Platform</p>
          </div>

          {/* Login card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-8">Sign in to report and track issues in your community</p>

            {/* Google Sign In button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  {/* Google G icon SVG */}
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center mt-4">{error}</p>
            )}
          </div>

          <p className="text-slate-600 text-xs text-center mt-6">
            By signing in you agree to our Terms of Service
          </p>

          <button
            onClick={() => setScreen('landing')}
            className="mt-6 w-full text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-blue-500 transition-colors"
          >
            Return to Hub
          </button>
        </div>
      </div>

      {/* Right side — Animated blob background (more visible on this half) */}
      <div className="hidden md:block w-1/2 relative z-[1]">
        <AnimatedBlobBackground />
      </div>

    </div>
  );
}
