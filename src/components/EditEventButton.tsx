import React, { useState } from 'react';
import type { EventFormat, EventItem } from '../types';
import { usePadel } from '../context/PadelContext';
import { PlayersTab } from './TournamentDetail/PlayersTab';

export function EditEventButton({ event }: { event: EventItem }) {
  const { currentUser } = usePadel();
  const [open, setOpen] = useState(false);
  if (event.ownerId !== currentUser.id && !event.coAdminIds.includes(currentUser.id)) return null;
  return <>
    <button type="button" onClick={() => setOpen(true)} className="text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl">Edit game</button>
    {open && <EditEventModal event={event} onClose={() => setOpen(false)} />}
  </>;
}

function EditEventModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const { updateEvent, currentUser } = usePadel();
  const [tab, setTab] = useState<'settings' | 'players'>('settings');
  const [name, setName] = useState(event.name);
  const [description, setDescription] = useState(event.description || '');
  const [format, setFormat] = useState<EventFormat>(event.format || (event.type === 'normal_match' ? 'standard_3_sets' : 'custom'));
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState(event.startTime.slice(0, 5));
  const [visibility, setVisibility] = useState(event.visibility);
  const [maxPlayers, setMaxPlayers] = useState(event.maxPlayers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formatLocked = Boolean(event.teams.length || event.groups.length || event.matches.length || !['draft', 'open', 'full'].includes(event.status));
  const inputClass = 'block w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white disabled:opacity-50';

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateEvent(event.id, { name, description, format, date, startTime, visibility, maxPlayers });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="edit-event-title" className="mx-auto my-6 max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-8 text-slate-200">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 id="edit-event-title" className="text-xl font-bold text-white">Edit game</h2>
        <button type="button" disabled={saving} onClick={onClose} className="p-2 rounded-xl bg-slate-800">Close</button>
      </div>
      <div className="flex gap-3 mb-5">
        {(['settings', 'players'] as const).map((value) => <button key={value} type="button" disabled={saving} aria-pressed={tab === value} onClick={() => setTab(value)} className={`px-4 py-2 rounded-xl capitalize ${tab === value ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>{value}</button>)}
      </div>
      {tab === 'players' ? <>
        <p className="text-sm text-slate-400 mb-4">Player changes take effect immediately. Add registered players or guests, or remove players below.</p>
        <PlayersTab event={event} isOwner={event.ownerId === currentUser.id} isCoAdmin={event.coAdminIds.includes(currentUser.id)} currentUserId={currentUser.id} />
      </> : <form onSubmit={save} className="space-y-4 text-sm">
        <fieldset disabled={saving} className="space-y-4">
          <label className="block">Event name<input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></label>
          <label className="block">Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} /></label>
          <label className="block">Game type<select disabled={formatLocked} value={format} onChange={(e) => { setFormat(e.target.value as EventFormat); if (e.target.value === 'standard_3_sets') setMaxPlayers(4); }} className={inputClass}>
            {format === 'americano' && <option value="americano" hidden disabled>Current format (unchanged)</option>}
            <option value="standard_3_sets">Standard Game - 3 sets</option><option value="custom">Custom tournament</option>
          </select></label>
          {formatLocked && <p className="text-xs text-amber-300">Game type is locked once teams or matches exist or the event has progressed beyond registration.</p>}
          <label className="block">Player capacity<input type="number" min={4} step={2} required disabled={format === 'standard_3_sets'} value={format === 'standard_3_sets' ? 4 : maxPlayers} onChange={(e) => setMaxPlayers(e.target.valueAsNumber)} className={inputClass} /></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>Date<input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></label>
            <label>Start time<input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} /></label>
          </div>
          <label className="block">Visibility<select value={visibility} onChange={(e) => setVisibility(e.target.value as EventItem['visibility'])} className={inputClass}><option value="private">Private</option><option value="public">Public</option></select></label>
        </fieldset>
        {error && <p role="alert" className="text-rose-300">{error}</p>}
        <button type="submit" disabled={saving} className="px-5 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button>
      </form>}
    </section>
  </div>;
}
