
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[index.tsx] Script loaded');

const rootElement = document.getElementById('root');
if (!rootElement) {
  const errorMsg = 'Root element #root not found';
  console.error('[index.tsx]', errorMsg);
  document.body.innerHTML = `<div style="padding: 40px; text-align: center; color: #dc2626;"><h1>${errorMsg}</h1></div>`;
} else {
  console.log('[index.tsx] Root element found, mounting React...');
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('[index.tsx] React app mounted successfully');
  } catch (error) {
    console.error('[index.tsx] Error mounting React:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #dc2626; font-family: system-ui;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Error Loading Application</h1>
        <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: left; overflow: auto; max-width: 600px; margin: 0 auto;">
${errorMessage}
        </pre>
        <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">
          Open browser console (F12) for more details
        </p>
      </div>
    `;
  }
}
