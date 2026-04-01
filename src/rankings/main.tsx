import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { RankingsPage } from './RankingsPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RankingsPage />
  </React.StrictMode>,
);
