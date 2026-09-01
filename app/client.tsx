import React from 'react';
import { createRoot } from 'react-dom/client';
import Portfolio from '@/components/portfolio';
import './globals.css';
const root=document.getElementById('root');
if(root)createRoot(root).render(<React.StrictMode><Portfolio/></React.StrictMode>);
