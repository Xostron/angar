import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './providers/router';
import Socket from './providers/socket';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Socket />
    <RouterProvider router={router} />
  </React.StrictMode>,
);
