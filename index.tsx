import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { EnvValidator } from './components/EnvValidator';
import OneSignal from 'react-onesignal';

// OneSignal Initialization
try {
  OneSignal.init({
    appId: "71f9b370-fb2a-4da8-9377-d0546c5900c0",
    allowLocalhostAsSecureOrigin: true,
    // @ts-ignore - Types are strict but this is valid
    notifyButton: {
      enable: false,
    },
  }).then(() => {
    console.log("✅ OneSignal Initialized");
  });
} catch (error) {
  console.error("❌ OneSignal Init Error:", error);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <EnvValidator>
        <App />
      </EnvValidator>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
