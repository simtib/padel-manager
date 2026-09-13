import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { usePadel } from '../context/PadelContext';

export function PlayerProfileButton({ playerId, displayName, isGuest = false }: { playerId: string; displayName: string; isGuest?: boolean }) {
  const [open, setOpen] = useState(false);
  const { allPlayers } = usePadel();
  const avatarUrl = allPlayers.find((player) => player.id === playerId)?.avatarUrl;
  return <>
    <button type="button" onClick={(event) => { event.stopPropagation(); setOpen(true); }} aria-label={`View ${displayName}'s profile`} title={`View ${displayName}'s profile`} className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-500/10 font-bold text-emerald-300 ring-1 ring-emerald-500/30 hover:ring-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-400">
      {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}
    </button>
    {open && createPortal(<PlayerProfileDialog playerId={playerId} displayName={displayName} isGuest={isGuest} onClose={() => setOpen(false)} />, document.body)}
  </>;
}

function PlayerProfileDialog({ playerId, displayName, isGuest, onClose }: { playerId: string; displayName: string; isGuest: boolean; onClose: () => void }) {
  const { allPlayers, currentUser } = usePadel();
  const player = playerId === currentUser.id ? currentUser : allPlayers.find((item) => item.id === playerId);
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); };
  }, []);
  const details = [
    ['Skill level', player?.skillLevel || player?.level],
    ['Preferred position', player?.preferredPosition || player?.position],
    ['Location', player?.location],
    ['Member since', player?.createdAt ? new Date(player.createdAt).toLocaleDateString() : undefined],
  ].filter(([, value]) => value);
  // Effect cleanup closes the dialog during Strict Mode's setup/cleanup replay.
  // That native close event must not dismiss the newly reopened profile.
  return <dialog ref={dialog} aria-labelledby={headingId} onCancel={onClose} onClick={(event) => {
    event.stopPropagation();
    if (event.target === event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }
  }} className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl backdrop:bg-slate-950/80">
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {player?.avatarUrl && <img src={player.avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />}
        <div className="min-w-0"><p className="text-xs text-emerald-400">{isGuest ? 'Guest player' : 'Player profile'}</p><h2 id={headingId} className="break-words text-xl font-bold">{player?.displayName || displayName}</h2></div>
      </div>
      <button type="button" autoFocus onClick={onClose} aria-label="Close player profile" className="rounded-xl bg-slate-800 p-3 hover:bg-slate-700"><X size={18} /></button>
    </div>
    {player && !isGuest ? <>
      <dl className="mb-6 grid grid-cols-2 gap-4 text-sm">{details.map(([label, value]) => <div key={label}><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1">{value}</dd></div>)}</dl>
      <h3 className="mb-3 text-sm font-semibold">Recorded stats</h3>
      <dl className="grid grid-cols-2 gap-3">{[['Events played', player.eventsPlayed], ['Matches played', player.matchesPlayed], ['Matches won', player.matchesWon], ['Win rate', `${player.winRate}%`]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-950 p-3"><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 text-lg font-bold text-emerald-300">{value}</dd></div>)}</dl>
    </> : <p className="text-sm text-slate-400">{isGuest ? 'This guest does not have a player account.' : 'No additional profile information is available yet.'}</p>}
  </dialog>;
}
