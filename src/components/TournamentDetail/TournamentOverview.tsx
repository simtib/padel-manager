import React, { useState } from 'react';
import { EventItem } from '../../types';
import { usePadel } from '../../context/PadelContext';
import { ManageVenuesModal } from '../ManageVenuesModal';
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Play,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  UserPlus,
  LogOut,
  Clock3,
  ExternalLink,
  Star,
  Map,
  Edit3,
  RefreshCw,
  LayoutGrid,
  Settings2
} from 'lucide-react';

interface TournamentOverviewProps {
  event: EventItem;
  isOwner: boolean;
  isCoAdmin: boolean;
  onOpenShareModal: () => void;
  onGenerateTeams: () => void;
  onGenerateGroups: () => void;
  onGenerateSchedule: () => void;
  onConfirmKnockouts: () => void;
}

export const TournamentOverview: React.FC<TournamentOverviewProps> = ({
  event,
  isOwner,
  isCoAdmin,
  onOpenShareModal,
  onGenerateTeams,
  onGenerateGroups,
  onGenerateSchedule,
  onConfirmKnockouts,
}) => {
  const { currentUser, joinEvent, leaveEvent, facilities, toggleFavoriteFacility, allPlayers } = usePadel();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [showManageVenuesModal, setShowManageVenuesModal] = useState(false);

  const facility = facilities.find((f) => f.id === event.facilityId);
  const isAdmin = isOwner || isCoAdmin;

  const confirmedCount = event.participants.filter((p) => p.status === 'confirmed').length;
  const waitingCount = event.participants.filter((p) => p.status === 'waiting_list').length;
  const capacityPct = Math.min(100, Math.round((confirmedCount / event.maxPlayers) * 100));

  const myParticipant = event.participants.find((p) => p.id === currentUser.id);
  const isParticipant = !!myParticipant;
  const isWaitingList = myParticipant?.status === 'waiting_list';
  const isFull = confirmedCount >= event.maxPlayers;

  return (
    <div className="space-y-6">
      {/* Hero Banner Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Padel Tournament
              </span>

              <span className="bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-full border border-slate-700">
                {event.visibility === 'private' ? '🔒 Private Link Event' : 'Public'}
              </span>

              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {event.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
              {event.name}
            </h1>

            {event.description && (
              <p className="text-sm text-slate-300 leading-relaxed">{event.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>

              <span className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-emerald-400" />
                {event.startTime}
              </span>

              <span className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {event.facilityName} ({event.courtIds.length} Courts)
              </span>

              {/* Event Format Badge */}
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border ${
                event.format === 'standard_3_sets'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : event.format === 'americano'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {event.format === 'standard_3_sets' ? (
                  <>
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Format: Standard Game (3 Sets)</span>
                  </>
                ) : event.format === 'americano' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Format: Americano</span>
                  </>
                ) : (
                  <>
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Format: Custom</span>
                  </>
                )}
              </span>

              {/* Map Link Button */}
              {facility?.googleMapsUrl ? (
                <a
                  href={facility.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold transition-all"
                  title="Open in Google Maps / Navigation"
                >
                  <Map className="w-3.5 h-3.5" /> Open Map Location <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                isAdmin && (
                  <button
                    onClick={() => setShowManageVenuesModal(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl"
                  >
                    + Add Map Link
                  </button>
                )
              )}

              {/* Star Favorite Toggle */}
              {facility && (
                <button
                  onClick={() => toggleFavoriteFacility(facility.id)}
                  className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-amber-400 transition-colors"
                  title={facility.isFavorite ? 'Saved as favorite venue' : 'Save as favorite venue'}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      facility.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-[11px] font-semibold">
                    {facility.isFavorite ? 'Favorite' : 'Favorite'}
                  </span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setShowManageVenuesModal(true)}
                  className="p-1.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                  title="Manage saved venues and map links"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Share Action */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={onOpenShareModal}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" /> Share WhatsApp Link
            </button>
          </div>
        </div>

        {/* Capacity Progress Section */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Registration Progress
              </span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {confirmedCount} / {event.maxPlayers} Confirmed Players
              </span>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${capacityPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Target: {event.maxTeams} Teams ({event.maxPlayers / 8} Groups of 4)</span>
              {waitingCount > 0 && (
                <span className="text-amber-400 font-medium">
                  {waitingCount} players on waiting list
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Organized By</p>
            <p className="font-bold text-white text-sm mt-0.5">{event.ownerName}</p>
            <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 rounded-full inline-block mt-1">
              Game Owner
            </span>
          </div>
        </div>
      </div>

      {/* Player Registration & Join Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Player Registration</h3>
          </div>
          <p className="text-xs text-slate-400">
            {isParticipant
              ? isWaitingList
                ? `You are on the waiting list at position #${myParticipant.waitingListPosition || 1}`
                : `You are confirmed as a registered player for this event!`
              : isFull
              ? `Event is currently full (${confirmedCount}/${event.maxPlayers}). Join waiting list to claim open spots.`
              : `Spots available! Join now to reserve your place in the tournament.`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {!isParticipant && (
            <div className="w-full sm:w-auto">
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Preferred Partner (Optional)</option>
                {allPlayers
                  .filter((p) => p.id !== currentUser.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <button
            onClick={async () => {
              if (isParticipant) {
                leaveEvent(event.id);
              } else {
                await joinEvent(event.id, selectedPartnerId || undefined);
              }
            }}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              isParticipant
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : isFull
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {isParticipant ? (
              <>
                <LogOut className="w-4 h-4" /> Withdraw Registration
              </>
            ) : isFull ? (
              <>
                <Clock3 className="w-4 h-4" /> Join Waiting List
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Join Game Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin Action Bar (Organizers Workflow) */}
      {(isOwner || isCoAdmin) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Tournament Organizer Controls
            </h3>
            <span className="text-xs text-slate-400">Step-by-step tournament workflow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1: Pair Teams */}
            <button
              onClick={onGenerateTeams}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                event.teams.length > 0
                  ? 'bg-slate-950 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-[10px] uppercase tracking-wider opacity-70">Step 1</span>
                {event.teams.length > 0 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="font-bold text-white">Generate Teams</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {event.teams.length > 0 ? `${event.teams.length} Teams Created` : 'Auto-pair players'}
              </p>
            </button>

            {/* Step 2: Divide Groups */}
            <button
              onClick={onGenerateGroups}
              disabled={event.teams.length === 0}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                event.groups.length > 0
                  ? 'bg-slate-950 border-emerald-500/50 text-emerald-400'
                  : event.teams.length > 0
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-[10px] uppercase tracking-wider opacity-70">Step 2</span>
                {event.groups.length > 0 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="font-bold text-white">Generate Groups</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {event.groups.length > 0 ? `${event.groups.length} Groups Created` : 'Divide into groups of 4'}
              </p>
            </button>

            {/* Step 3: Fixtures & Courts */}
            <button
              onClick={onGenerateSchedule}
              disabled={event.groups.length === 0}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                event.matches.length > 0
                  ? 'bg-slate-950 border-emerald-500/50 text-emerald-400'
                  : event.groups.length > 0
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-[10px] uppercase tracking-wider opacity-70">Step 3</span>
                {event.matches.length > 0 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="font-bold text-white">Generate Matches</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {event.matches.length > 0 ? `${event.matches.length} Matches Scheduled` : 'Round-robin courts'}
              </p>
            </button>

            {/* Step 4: Knockouts */}
            <button
              onClick={onConfirmKnockouts}
              disabled={event.matches.length === 0}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                event.status === 'knockout_stage' || event.status === 'completed'
                  ? 'bg-slate-950 border-rose-500/50 text-rose-400'
                  : event.matches.length > 0
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold'
                  : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-[10px] uppercase tracking-wider opacity-70">Step 4</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <p className="font-bold">Start Knockout Bracket</p>
              <p className="text-[11px] opacity-80 mt-0.5">Qualify group winners</p>
            </button>
          </div>
        </div>
      )}

      {showManageVenuesModal && (
        <ManageVenuesModal
          initialEditFacilityId={event.facilityId}
          onClose={() => setShowManageVenuesModal(false)}
        />
      )}
    </div>
  );
};
