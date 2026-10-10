import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ThreatProvider } from './context/ThreatContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThreatProvider>
        <App />
      </ThreatProvider>
    </BrowserRouter>
  </React.StrictMode>
);

