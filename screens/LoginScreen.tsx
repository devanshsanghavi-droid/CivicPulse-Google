
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import { mockApi } from '../services/mockApi';

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginScreen() {
  const { setUser, setScreen } = useApp();
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  /**
   * IMPORTANT: 
   * 1. Go to console.cloud.google.com
   * 2. Create a "Web Application" Client ID.
   * 3. Add THIS current page URL to "Authorized JavaScript Origins".
   * 4. Paste your new Client ID below.
   */
  const CLIENT_ID = "YOUR_NEW_WEB_CLIENT_ID_HERE.apps.googleusercontent.com";

  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        
        // Successful SSO
        const user = mockApi.signup(payload.email, 'google-sso', payload.name);
        setUser(user);
        setScreen('feed');
      } catch (err) {
        setError("Identity Link Failed: Origin may not be authorized in Cloud Console.");
      }
    };

    const initializeGSI = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            context: 'signin',
            itp_support: true // Improved support for Intelligent Tracking Prevention
          });

          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: "outline",
              size: "large",
              width: "320",
              shape: "pill",
              text: "signin_with",
              logo_alignment: "left"
            });
          }
          
          window.google.accounts.id.prompt(); 
        } catch (err) {
          console.error("GSI Initialization Error:", err);
        }
      }
    };

    // Retry loop for dynamic script loading
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        initializeGSI();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [setUser, setScreen]);

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
            <div ref={googleButtonRef} className="animate-in fade-in slide-in-from-bottom-2 duration-700" />
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl border border-red-100 leading-relaxed">
              {error}
              <br/>
              <span className="text-gray-400 mt-1 block">Check "Authorized JavaScript Origins"</span>
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
