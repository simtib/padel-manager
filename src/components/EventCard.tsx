import React from 'react';
import { EventItem } from '../types';
import { usePadel } from '../context/PadelContext';
import { Trophy, Calendar, MapPin, Users, ChevronRight, ShieldCheck, Clock, UserPlus, CheckCircle, LogOut, Clock3, Map, ExternalLink, Star } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelect: (eventId: string) => void;
  currentUserId: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, currentUserId }) => {
  const { joinEvent, leaveEvent, facilities } = usePadel();
  const confirmedCount = event.participants.filter((p) => p.status === 'confirmed').length;
  const isOwner = event.ownerId === currentUserId;
  const isCoAdmin = event.coAdminIds.includes(currentUserId);

  const facility = facilities.find((f) => f.id === event.facilityId);

  const myParticipant = event.participants.find((p) => p.id === currentUserId);
  const isParticipant = !!myParticipant;
  const isWaitingList = myParticipant?.status === 'waiting_list';
  const isFull = confirmedCount >= event.maxPlayers;

  const capacityPct = Math.min(100, Math.round((confirmedCount / event.maxPlayers) * 100));

  const handleQuickJoinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isParticipant) {
      leaveEvent(event.id);
    } else {
      joinEvent(event.id);
    }
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case 'open':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Open</span>;
      case 'full':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Registration Full</span>;
      case 'teams_generated':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Teams Ready</span>;
      case 'ready':
      case 'in_progress':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase animate-pulse">Live Matches</span>;
      case 'knockout_stage':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase animate-pulse">🏆 Knockout Stage</span>;
      case 'completed':
        return <span className="bg-slate-700/50 text-slate-300 border border-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Completed</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">{event.status}</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect(event.id)}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/5 flex flex-col justify-between"
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-lg">
              {event.type === 'tournament' ? (
                <>
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Tournament
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> 2v2 Match
                </>
              )}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              event.format === 'standard_3_sets'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : event.format === 'americano'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {event.format === 'standard_3_sets'
                ? 'Standard (3 Sets)'
                : event.format === 'americano'
                ? 'Americano'
                : 'Custom'}
            </span>
            {getStatusBadge()}
          </div>

          {(isOwner || isCoAdmin) && (
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3 h-3" /> {isOwner ? 'Owner' : 'Co-Admin'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors font-display line-clamp-1">
          {event.name}
        </h3>

        {/* Details */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
            <span>{event.startTime}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{event.facilityName}</span>
              {facility?.isFavorite && (
                <span title="Favorite Venue">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                </span>
              )}
            </div>

            {facility?.googleMapsUrl && (
              <a
                href={facility.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 transition-all"
                title="Open in Google Maps"
              >
                <Map className="w-3 h-3" /> Map <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Player Capacity Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Players Registered
            </span>
            <span className="font-bold text-white">
              {confirmedCount} / {event.maxPlayers}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPct >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Join Action Bar */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={handleQuickJoinToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
            isParticipant
              ? isWaitingList
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
              : isFull
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-md shadow-emerald-500/10'
          }`}
          title={isParticipant ? 'Click to withdraw' : 'Click to join game'}
        >
          {isParticipant ? (
            isWaitingList ? (
              <>
                <Clock3 className="w-3.5 h-3.5" /> Waitlist Position #{myParticipant.waitingListPosition || 1}
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Joined Game
              </>
            )
          ) : isFull ? (
            <>
              <UserPlus className="w-3.5 h-3.5" /> Join Waitlist
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" /> Join Game
            </>
          )}
        </button>

        <span className="flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
          Details <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
