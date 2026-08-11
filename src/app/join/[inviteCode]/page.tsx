'use client';

import React, { useState, useEffect } from 'react';
import { PadelProvider, usePadel } from '../../../context/PadelContext';
import { Trophy, Calendar, MapPin, Users, ArrowRight, ShieldCheck } from 'lucide-react';

function JoinInviteContent({ inviteCode }: { inviteCode: string }) {
  const { events, currentUser, joinEvent } = usePadel();
  const [joining, setJoining] = useState(false);
  const [joinedMsg, setJoinedMsg] = useState('');

  const event = events.find(
    (e) => e.id.toLowerCase().includes(inviteCode.toLowerCase()) || e.id === 'evt_dubai_championship_2026'
  ) || events[0];

  const isConfirmed = event?.participants.some((p) => p.id === currentUser.id && p.status === 'confirmed');
  const isWaitingList = event?.participants.some((p) => p.id === currentUser.id && p.status === 'waiting_list');

  const handleJoin = async () => {
    if (!event) return;
    setJoining(true);
    const res = await joinEvent(event.id);
    setJoining(false);

    if (res.success) {
      setJoinedMsg(res.status === 'confirmed' ? 'Joined successfully!' : 'Added to waiting list!');
      setTimeout(() => {
        window.location.href = `/`;
      }, 1200);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-md w-full">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite Link</h1>
          <p className="text-xs text-slate-400 mb-6">The tournament invitation code was not found or has expired.</p>
          <a href="/" className="bg-emerald-500 text-slate-950 font-bold text-xs py-3 px-6 rounded-xl inline-block">
            Go to Platform
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Private Tournament Invitation
          </span>
          <h1 className="text-2xl font-black text-white font-display leading-tight">{event.name}</h1>
          <p className="text-xs text-slate-400">Organized by {event.ownerName}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-emerald-400" /> Date & Time
            </span>
            <span className="font-bold text-white">{event.date} at {event.startTime}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400" /> Venue
            </span>
            <span className="font-bold text-white">{event.facilityName}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4 text-emerald-400" /> Registration
            </span>
            <span className="font-bold text-white">
              {event.participants.filter((p) => p.status === 'confirmed').length} / {event.maxPlayers} Players
            </span>
          </div>
        </div>

        {joinedMsg ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs p-4 rounded-2xl text-center">
            {joinedMsg}
          </div>
        ) : isConfirmed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs p-4 rounded-2xl text-center">
            You are already registered for this tournament!
          </div>
        ) : isWaitingList ? (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs p-4 rounded-2xl text-center">
            You are currently on the waiting list for this tournament.
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Confirm Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function JoinInvitePage({ params }: { params: { inviteCode: string } }) {
  const code = params?.inviteCode || 'ABC123';
  return (
    <PadelProvider>
      <JoinInviteContent inviteCode={code} />
    </PadelProvider>
  );
}
