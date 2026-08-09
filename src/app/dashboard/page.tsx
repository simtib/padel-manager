'use client';

import React, { useEffect, useState } from 'react';
import App from '../../App';
import { createClient } from '../../lib/supabase/client';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthenticated(true);
        } else {
          window.location.href = '/login';
        }
      } catch (err) {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xs text-slate-400 font-semibold animate-pulse">Checking session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <App />;
}

