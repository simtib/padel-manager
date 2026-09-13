'use client';

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AppRole } from '../../types';
import type { Database } from '../../types/database.types';
import {
  Users,
  MapPin,
  Activity,
  Trophy,
  MessageSquare,
  AlertTriangle,
  ClipboardList,
  ArrowRight,
  Clock,
  ShieldAlert
} from 'lucide-react';

type Tables = Database['public']['Tables'];
type Profile = Pick<Tables['profiles']['Row'], 'id' | 'first_name' | 'last_name' | 'display_name' | 'email' | 'phone' | 'role'>;
type Court = Tables['courts']['Row'];
type Club = Pick<Tables['facilities']['Row'], 'id' | 'name' | 'address' | 'city' | 'country'> & { courts: Court[] };
type Feedback = Tables['feedback']['Row'];
type Support = Tables['support_cases']['Row'];
type History = Tables['role_changes']['Row'];
export type Tab = 'profile' | 'dashboard' | 'users' | 'clubs' | 'feedback' | 'support' | 'roles';
const tabs: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' }, { id: 'dashboard', label: 'Overview' },
  { id: 'users', label: 'Users' }, { id: 'clubs', label: 'Clubs' }, { id: 'feedback', label: 'Feedback' },
  { id: 'support', label: 'Support' }, { id: 'roles', label: 'Audit Log' },
];
const button = 'rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-40';
const inputClass = 'mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white';
const card = 'rounded-xl border border-slate-800 bg-slate-900 p-5';

function Field({ name, label, value = '', required = true, maxLength = 200 }: { name: string; label: string; value?: string | null; required?: boolean; maxLength?: number }) {
  return <label className="block text-sm text-slate-300">{label}<input name={name} defaultValue={value || ''} required={required} maxLength={maxLength} className={inputClass} /></label>;
}
function Choice({ name, label, value, options }: { name: string; label: string; value: string; options: string[] }) {
  return <label className="block text-sm text-slate-300">{label}<select name={name} defaultValue={value} className={inputClass}>
    {options.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
  </select></label>;
}
function Form({ children, onSave, label = 'Save changes' }: { children: ReactNode; onSave: (fields: Record<string, string>) => void; label?: string }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>);
  };
  return <form onSubmit={submit} className="mt-4 space-y-3">{children}<button className={button}>{label}</button></form>;
}

export default function AdminPanel({ role, currentUserId, tab, initialSupportUser = '' }: { role: AppRole; currentUserId: string; tab: Tab; initialSupportUser?: string }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<unknown[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [supportUser] = useState(initialSupportUser);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setRows([]); setError('');
    fetch(`/api/admin?resource=${tab}&page=${page}`, { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Could not load this section.');
        if (!controller.signal.aborted) {
          if (tab === 'dashboard') {
            setRows([body.data]);
          } else {
            setRows(body.data);
            setCount(body.count);
          }
        }
      }).catch((err: Error) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [tab, page, revision]);

  const save = useCallback(async (payload: Record<string, unknown>) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save changes.');
      setNotice('Changes saved.'); setRevision((value) => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save changes.'); }
    finally { setBusy(false); }
  }, []);
  const remove = (action: string, id: string, message: string) => {
    if (window.confirm(message)) void save({ action, id });
  };
  const navigate = (next: Tab, userId = '') => {
    const section = next === 'dashboard' ? 'overview' : next === 'roles' ? 'audit' : next;
    router.push(`/admin?section=${section}${userId ? `&user=${encodeURIComponent(userId)}` : ''}`);
  };

  const clubFields = (club?: Club) => <div className="grid gap-3 sm:grid-cols-2">
    <Field name="name" label="Club name" value={club?.name} /><Field name="address" label="Address" value={club?.address} maxLength={500} />
    <Field name="city" label="City" value={club?.city} maxLength={100} /><Field name="country" label="Country" value={club?.country || 'United Arab Emirates'} maxLength={100} />
  </div>;
  const courtForm = (club: Club, court?: Court) => <Form label={court ? 'Save court' : 'Add court'} onSave={(fields) => void save({ action: 'court.save', id: court?.id, facility_id: club.id, name: fields.name, court_number: Number(fields.court_number), is_active: fields.is_active === 'true' })}>
    <Field name="name" label="Court name" value={court?.name} maxLength={100} />
    <label className="block text-sm">Court number<input className={inputClass} type="number" name="court_number" min="1" required defaultValue={court?.court_number || 1} /></label>
    <Choice name="is_active" label="Active" value={String(court?.is_active ?? true)} options={['true', 'false']} />
  </Form>;

  const dashboard = tab === 'dashboard' && rows[0] ? (rows[0] as any) : null;

  return <>
    {error && <p role="alert" className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">{error}</p>}
    {tab === 'roles' && <p className="mb-4 text-sm text-slate-400">Application role changes and who authorized them.</p>}
    {notice && <p role="status" className="mb-4 text-emerald-300">{notice}</p>}
    <div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-semibold">{tabs.find((item) => item.id === tab)?.label}</h1>
      <button disabled={busy || loading} onClick={() => setRevision((value) => value + 1)} className="text-sm text-emerald-300 disabled:opacity-40">Refresh</button></div>
    {loading ? <p role="status" className="py-12 text-slate-400">Loading…</p> : <fieldset disabled={busy} className="space-y-4 disabled:opacity-70">
      {tab === 'dashboard' && dashboard && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex items-center gap-4 hover:border-slate-700 transition">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Users</p>
                <h3 className="text-2xl font-bold text-white mt-1">{dashboard.kpis.usersCount}</h3>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex items-center gap-4 hover:border-slate-700 transition">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Clubs</p>
                <h3 className="text-2xl font-bold text-white mt-1">{dashboard.kpis.clubsCount}</h3>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex items-center gap-4 hover:border-slate-700 transition">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Matches</p>
                <h3 className="text-2xl font-bold text-white mt-1">{dashboard.kpis.matchesCount}</h3>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex items-center gap-4 hover:border-slate-700 transition">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Open Feedback</p>
                <h3 className="text-2xl font-bold text-white mt-1">{dashboard.kpis.openFeedbackCount}</h3>
              </div>
            </div>
          </div>

          {/* Needs Attention Section */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* New Feedback Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold text-white">New User Feedback</h3>
                </div>
                <span className="text-xs bg-amber-400/10 text-amber-400 px-2.5 py-1 rounded-full font-medium">
                  {dashboard.needsAttention.newFeedback.length} new
                </span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[280px] overflow-y-auto pr-1">
                {dashboard.needsAttention.newFeedback.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No new feedback items requiring review.</p>
                ) : (
                  dashboard.needsAttention.newFeedback.map((f: any) => (
                    <div key={f.id} className="py-3 first:pt-0 last:pb-0 flex flex-col justify-between gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-emerald-300 uppercase tracking-tight">{f.type.replaceAll('_', ' ')}</span>
                        <span className="text-[10px] text-slate-500">{new Date(f.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">{f.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{f.description}</p>
                      <button
                        onClick={() => navigate('feedback')}
                        className="text-xs text-emerald-400 hover:underline self-start mt-1 font-medium flex items-center gap-1"
                      >
                        Handle Feedback <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Operational Support Cases Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-bold text-white">Active Support Cases</h3>
                </div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full font-medium">
                  {dashboard.needsAttention.openSupport.length} active
                </span>
              </div>
              <div className="divide-y divide-slate-800 max-h-[280px] overflow-y-auto pr-1">
                {dashboard.needsAttention.openSupport.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">All support tickets resolved.</p>
                ) : (
                  dashboard.needsAttention.openSupport.map((s: any) => (
                    <div key={s.id} className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          s.status === 'open' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {s.status.replaceAll('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">{s.subject}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{s.notes}</p>
                      <button
                        onClick={() => navigate('support')}
                        className="text-xs text-emerald-400 hover:underline self-start mt-1 font-medium flex items-center gap-1"
                      >
                        Update ticket <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed and Audit Log */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Unified Activity Feed */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white">Recent Platform Activity</h3>
              </div>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {dashboard.recentActivity.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No recent activity detected.</p>
                ) : (
                  dashboard.recentActivity.map((act: any) => (
                    <div key={act.id} className="flex gap-3 text-sm items-start">
                      <div className="mt-1 flex-shrink-0">
                        <span className={`flex h-2 w-2 rounded-full ${
                          act.type === 'user' ? 'bg-emerald-400' :
                          act.type === 'event' ? 'bg-blue-400' :
                          act.type === 'feedback' ? 'bg-amber-400' :
                          act.type === 'support' ? 'bg-indigo-400' : 'bg-purple-400'
                        }`} />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-300">{act.title}</p>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(act.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{act.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin Audit Log (Privileged Role changes) */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <ClipboardList className="h-5 w-5 text-purple-400" />
                <h3 className="font-bold text-white">Recent role changes</h3>
              </div>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {role !== 'super_admin' ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-sm text-slate-400 font-medium">Access Restricted</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Only Super Administrators have permissions to view system-wide privilege changes and security audit trails.
                    </p>
                  </div>
                ) : dashboard.auditLog.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No system privilege audits recorded.</p>
                ) : (
                  dashboard.auditLog.map((log: any) => (
                    <div key={log.id} className="border-l-2 border-purple-500/50 pl-3 py-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-purple-300">USER ROLE UPDATED</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200">
                        {log.old_role.replaceAll('_', ' ')} → {log.new_role.replaceAll('_', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-400 break-all leading-relaxed">
                        User ID: {log.user_id || 'Deleted'}<br />
                        Authorized by Actor: {log.actor_id || 'Deleted'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {(tab === 'users' || tab === 'profile') && (rows as Profile[]).map((user) => <details key={`${user.id}-${revision}`} open={tab === 'profile' ? true : undefined} className={card}>
        <summary className="cursor-pointer"><span className="font-semibold">{user.display_name}</span><span className="ml-3 text-sm text-emerald-300">{user.role.replaceAll('_', ' ')}</span><p className="mt-1 text-sm text-slate-400">{user.email}</p></summary>
        <Form onSave={(fields) => void save({ action: 'profile.update', id: user.id, ...fields })}>
          <div className="grid gap-3 sm:grid-cols-2"><Field name="first_name" label="First name" value={user.first_name} maxLength={100} /><Field name="last_name" label="Last name" value={user.last_name} required={false} maxLength={100} />
            <Field name="display_name" label="Display name" value={user.display_name} /><Field name="phone" label="Phone" value={user.phone} required={false} maxLength={40} /></div>
        </Form>
        {tab === 'users' && role === 'super_admin' && user.id !== currentUserId && <Form label="Change role" onSave={(fields) => void save({ action: 'role.set', id: user.id, role: fields.role })}>
          <Choice name="role" label="Application role" value={user.role} options={['user', 'admin', 'super_admin']} />
        </Form>}
        {tab === 'users' && role === 'super_admin' && user.id === currentUserId && <p className="mt-3 text-sm text-slate-400">Another super admin must change your role.</p>}
        {tab === 'users' && <button className="mt-4 text-sm text-emerald-300" onClick={() => navigate('support', user.id)}>Open a support case for this user</button>}
      </details>)}
      {tab === 'clubs' && <>
        <details className={card}><summary className="cursor-pointer font-semibold text-emerald-300">Add a club</summary><Form label="Create club" onSave={(fields) => void save({ action: 'club.save', ...fields })}>{clubFields()}</Form></details>
        {(rows as Club[]).map((club) => <details key={`${club.id}-${revision}`} className={card}><summary className="cursor-pointer font-semibold">{club.name}<span className="ml-3 text-sm font-normal text-slate-400">{club.city} · {club.courts.length} courts</span></summary>
          <Form onSave={(fields) => void save({ action: 'club.save', id: club.id, ...fields })}>{clubFields(club)}</Form>
          <h3 className="mt-6 font-semibold">Courts</h3>
          {club.courts.map((court) => <details key={court.id} className="mt-3 rounded-lg border border-slate-700 p-3"><summary className="cursor-pointer text-sm">{court.name}{!court.is_active && ' (inactive)'}</summary>{courtForm(club, court)}
            <button className="mt-3 text-sm text-rose-300" onClick={() => remove('court.delete', court.id, `Delete ${court.name}?`)}>Delete court</button></details>)}
          <details className="mt-3 rounded-lg border border-slate-700 p-3"><summary className="cursor-pointer text-sm text-emerald-300">Add a court</summary>{courtForm(club)}</details>
          <button className="mt-5 text-sm text-rose-300" onClick={() => remove('club.delete', club.id, `Delete ${club.name} and its courts? Existing events may lose their club assignment.`)}>Delete club</button>
        </details>)}
      </>}
      {tab === 'feedback' && (rows as Feedback[]).map((item) => <article key={`${item.id}-${revision}`} className={card}>
        <p className="text-xs text-slate-400">{item.type.replaceAll('_', ' ')} · {new Date(item.created_at).toLocaleString()}</p><h3 className="mt-2 font-semibold">{item.title}</h3>
        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-300">{item.description}</p><p className="mt-3 break-all text-xs text-slate-400">User: {item.user_id} · Contact consent: {item.contact_consent ? 'Yes' : 'No'}{item.page_route && ` · Page: ${item.page_route}`}</p>
        <Form label="Update status" onSave={(fields) => void save({ action: 'feedback.status', id: item.id, status: fields.status })}><Choice name="status" label="Status" value={item.status} options={['new', 'reviewing', 'planned', 'done', 'rejected']} /></Form>
      </article>)}
      {tab === 'support' && <>
        <details className={card} open={supportUser ? true : undefined}><summary className="cursor-pointer font-semibold text-emerald-300">Open a support case</summary>
          <p className="mt-3 text-sm text-slate-400">Internal notes are visible to admins only. Select a user from the Users section or enter their ID.</p>
          <Form label="Create case" onSave={(fields) => void save({ action: 'support.create', ...fields })}><Field key={supportUser} name="user_id" label="User ID" value={supportUser} maxLength={36} /><Field name="subject" label="Subject" />
            <label className="block text-sm text-slate-300">Internal notes<textarea name="notes" maxLength={10000} className={inputClass} rows={4} /></label></Form>
        </details>
        {(rows as Support[]).map((item) => <details key={`${item.id}-${revision}`} className={card}><summary className="cursor-pointer font-semibold">{item.subject}<span className="ml-3 text-sm text-emerald-300">{item.status.replaceAll('_', ' ')}</span></summary>
          <p className="mt-3 break-all text-xs text-slate-400">User: {item.user_id}</p>
          <Form onSave={(fields) => void save({ action: 'support.update', id: item.id, ...fields })}><Field name="subject" label="Subject" value={item.subject} /><label className="block text-sm text-slate-300">Internal notes<textarea name="notes" defaultValue={item.notes} maxLength={10000} rows={5} className={inputClass} /></label>
            <Choice name="status" label="Status" value={item.status} options={['open', 'in_progress', 'resolved']} /></Form>
        </details>)}
      </>}
      {tab === 'roles' && (rows as History[]).map((item) => <article key={item.id} className={card}><p className="font-semibold">{item.old_role.replaceAll('_', ' ')} → {item.new_role.replaceAll('_', ' ')}</p>
        <p className="mt-2 break-all text-sm text-slate-400">User: {item.user_id || 'Deleted user'}<br />Changed by: {item.actor_id || 'Deleted user'}<br />{new Date(item.created_at).toLocaleString()}</p></article>)}
      {!error && rows.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No records found.</p>}
    </fieldset>}
    {tab !== 'dashboard' && tab !== 'profile' && (
      <div className="mt-6 flex items-center justify-between gap-3 text-sm">
        <button className={button} disabled={page === 0 || loading || busy} onClick={() => setPage((value) => value - 1)}>Previous</button>
        <span className="text-slate-400">Page {page + 1} · {count} records</span>
        <button className={button} disabled={(page + 1) * 50 >= count || loading || busy} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
    )}
  </>;
}
