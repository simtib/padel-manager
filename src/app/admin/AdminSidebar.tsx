'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, MessageSquare, Users, MapPin, Trophy, CalendarDays, BarChart3, ClipboardList, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

const items = [
  ['overview', 'Overview', LayoutDashboard], ['feedback', 'Feedback', MessageSquare],
  ['users', 'Users', Users], ['clubs', 'Clubs', MapPin], ['matches', 'Matches', Trophy],
  ['bookings', 'Bookings', CalendarDays], ['reports', 'Reports', BarChart3],
  ['audit', 'Audit Log', ClipboardList], ['settings', 'Settings', Settings], ['profile', 'Profile', User],
] as const;

export default function AdminSidebar({ role }: { role: string }) {
  const section = useSearchParams().get('section') || 'overview';
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signOut = async () => {
    setBusy(true); setError('');
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      window.location.assign('/login');
    } catch { setError('Could not sign out. Please try again.'); setBusy(false); }
  };
  return <aside className="border-b border-slate-800 bg-slate-900 lg:fixed lg:inset-y-0 lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r">
    <div className="flex items-center justify-between p-6"><Link href="/admin" className="text-lg font-bold text-emerald-300">PadelManager</Link>
      <button aria-label="Toggle admin navigation" aria-expanded={open} onClick={() => setOpen(!open)} className="p-2 lg:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button></div>
    <nav aria-label="Admin navigation" className={`${open ? 'block' : 'hidden'} space-y-1 px-3 pb-6 lg:block`}>
      {items.filter(([id]) => id !== 'audit' || role === 'super_admin').map(([id, label, Icon]) => <Link key={id} href={id === 'overview' ? '/admin' : `/admin?section=${id}`} onClick={() => setOpen(false)} aria-current={section === id || (section === 'support' && id === 'users') ? 'page' : undefined}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${section === id || (section === 'support' && id === 'users') ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}><Icon size={18} />{label}</Link>)}
      <button disabled={busy} onClick={signOut} className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"><LogOut size={18} />{busy ? 'Signing out…' : 'Sign Out'}</button>
      {error && <p role="alert" className="px-4 text-sm text-rose-300">{error}</p>}
    </nav>
  </aside>;
}
