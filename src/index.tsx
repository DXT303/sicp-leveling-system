import React from 'react';
import ReactDOM from 'react-dom/client';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';

const path = window.location.pathname;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    {path === '/signup' ? <SignUpPage /> : <LoginPage />}
  </React.StrictMode>
);
