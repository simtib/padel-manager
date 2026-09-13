import { notFound, redirect } from 'next/navigation';
import { AdminError, requireAdmin } from '../../lib/admin';
import AdminPanel, { type Tab } from './AdminPanel';
const sections: Record<string, Tab> = { overview: 'dashboard', users: 'users', clubs: 'clubs', feedback: 'feedback', support: 'support', audit: 'roles', profile: 'profile' };
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ section?: string; user?: string }> }) {
  const query = await searchParams;
  const section = query.section || 'overview';
  const { profile, user } = await requireAdmin().catch((error: unknown) => {
    if (error instanceof AdminError) redirect(error.status === 401 ? '/login' : '/dashboard');
    throw error;
  });
  if (section === 'audit' && profile.role !== 'super_admin') return <p className="text-slate-400">Audit Log is available to super admins only.</p>;
  if (['matches', 'bookings', 'reports', 'settings'].includes(section)) return <section><h1 className="mb-6 text-2xl font-semibold capitalize">{section}</h1><div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-400">Coming soon</div></section>;
  const tab = sections[section];
  if (!tab) notFound();
  return <AdminPanel key={section + (query.user || '')} tab={tab} role={profile.role} currentUserId={user.id} initialSupportUser={query.user} />;
}
