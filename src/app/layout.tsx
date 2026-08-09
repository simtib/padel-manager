import React from 'react';
import '../index.css';

export const metadata = {
  title: 'Padel Manager - Tournaments & Games',
  description: 'Organize and manage private padel games and tournaments in the UAE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
