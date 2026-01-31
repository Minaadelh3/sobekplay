import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import { EnvValidator } from './components/EnvValidator';


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
