import React, { useState } from 'react';
import { EventItem, Team, TeamMember } from '../types';
import { usePadel } from '../context/PadelContext';
import { ScoreEntryModal } from './ScoreEntryModal';
import { ManageVenuesModal } from './ManageVenuesModal';
import { AdminAddPlayerModal } from './AdminAddPlayerModal';
import { Trophy, Calendar, MapPin, Users, Edit3, ArrowLeft, CheckCircle, UserPlus, LogOut, Clock3, Map, ExternalLink, Star, LayoutGrid, RefreshCw, Settings2, GripVertical, Sparkles, ArrowLeftRight, Check, Trash2 } from 'lucide-react';

interface NormalMatchDetailProps {
  event: EventItem;
  onBack: () => void;
  currentUserId: string;
}

type PlayerSlot = 'player1' | 'player2';

interface TargetLocation {
  teamId: string;
  slot: PlayerSlot;
}

export const NormalMatchDetail: React.FC<NormalMatchDetailProps> = ({
  event,
  onBack,
  currentUserId,
}) => {
  const { joinEvent, leaveEvent, deleteEvent, recordMatchScoreAction, facilities, toggleFavoriteFacility, updateTeams } = usePadel();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showManageVenuesModal, setShowManageVenuesModal] = useState(false);
  const [showAdminAddPlayerModal, setShowAdminAddPlayerModal] = useState(false);

  // Drag and drop / swap state for team composition
  const [draggedLocation, setDraggedLocation] = useState<TargetLocation | null>(null);
  const [dragOverLocation, setDragOverLocation] = useState<TargetLocation | null>(null);
  const [selectedForSwap, setSelectedForSwap] = useState<TargetLocation | null>(null);
  const [swapNotice, setSwapNotice] = useState<string | null>(null);

  const facility = facilities.find((f) => f.id === event.facilityId);
  const isOwner = event.ownerId === currentUserId;
  const isCoAdmin = event.coAdminIds.includes(currentUserId);
  const isAdmin = isOwner || isCoAdmin;

  const confirmedCount = event.participants.filter((p) => p.status === 'confirmed').length;
  const myParticipant = event.participants.find((p) => p.id === currentUserId);
  const isParticipant = !!myParticipant;
  const isWaitingList = myParticipant?.status === 'waiting_list';
  const isFull = confirmedCount >= event.maxPlayers;

  const match = event.matches[0];
  const teamsMap: Record<string, Team> = {};
  event.teams.forEach((t) => {
    teamsMap[t.id] = t;
  });

  const team1 = event.teams[0];
  const team2 = event.teams[1];

  const winnerTeam = match?.winnerTeamId ? teamsMap[match.winnerTeamId] : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Events List
      </button>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Normal 2v2 Match
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                event.format === 'standard_3_sets'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  : event.format === 'americano'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {event.format === 'standard_3_sets'
                  ? 'Standard Game (3 Sets)'
                  : event.format === 'americano'
                  ? 'Americano Format'
                  : 'Custom Format'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white font-display">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> {event.date} at {event.startTime}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> {event.facilityName}
              </span>

              {/* Map Link Button */}
              {facility?.googleMapsUrl ? (
                <a
                  href={facility.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl transition-all"
                  title="Open in Google Maps / Directions"
                >
                  <Map className="w-3.5 h-3.5" /> Map Link <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                isAdmin && (
                  <button
                    onClick={() => setShowManageVenuesModal(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl"
                  >
                    + Add Map Link
                  </button>
                )
              )}

              {/* Favorite Star */}
              {facility && (
                <button
                  onClick={() => toggleFavoriteFacility(facility.id)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                  title={facility.isFavorite ? 'Saved as favorite venue' : 'Save as favorite venue'}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      facility.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                    }`}
                  />
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setShowManageVenuesModal(true)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  title="Manage saved venues"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={async () => {
                  if (!window.confirm(`Delete "${event.name}"? This cannot be undone.`)) return;
                  if (await deleteEvent(event.id)) onBack();
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button
              onClick={async () => {
                if (isParticipant) {
                  leaveEvent(event.id);
                } else {
                  await joinEvent(event.id);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                isParticipant
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isFull
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isParticipant ? (
                <>
                  <LogOut className="w-3.5 h-3.5" /> Withdraw
                </>
              ) : isFull ? (
                <>
                  <Clock3 className="w-3.5 h-3.5" /> Waitlist
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" /> Join Game
                </>
              )}
            </button>

            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {event.status}
            </span>
          </div>
        </div>

        {/* Players / Participants Status Bar */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Registered Players ({confirmedCount}/4)</p>
              <p className="text-[11px] text-slate-400">
                {event.participants.map((p) => p.displayName).join(', ') || 'No players yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowAdminAddPlayerModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-1.5 px-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Player
              </button>
            )}

            {isParticipant && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Registered
              </span>
            )}
          </div>
        </div>

        {/* Teams & Drag & Drop Composition Arena */}
        {event.teams.length >= 2 && (
          <div className="space-y-3">
            {isAdmin && (
              <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <GripVertical className="w-4 h-4 text-emerald-400" />
                  <span>Drag & Drop player boxes between teams to adjust composition</span>
                </div>
                {swapNotice ? (
                  <span className="bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[11px]">
                    {swapNotice}
                  </span>
                ) : selectedForSwap ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5 animate-spin" /> Tap second player box
                  </span>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Team 1 Box */}
              <div className={`p-5 rounded-2xl border transition-all ${
                match?.winnerTeamId === team1?.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Team 1 Box</span>
                    <p className="font-extrabold text-white text-base">{team1?.name || 'Team 1'}</p>
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    {typeof match?.team1Score === 'number' ? match.team1Score : '-'}
                  </div>
                </div>

                {/* Team 1 Player Boxes */}
                <div className="space-y-2">
                  {team1 && renderPlayerSlotCard(team1, 'player1')}
                  {team1 && renderPlayerSlotCard(team1, 'player2')}
                </div>
              </div>

              {/* Team 2 Box */}
              <div className={`p-5 rounded-2xl border transition-all ${
                match?.winnerTeamId === team2?.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Team 2 Box</span>
                    <p className="font-extrabold text-white text-base">{team2?.name || 'Team 2'}</p>
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    {typeof match?.team2Score === 'number' ? match.team2Score : '-'}
                  </div>
                </div>

                {/* Team 2 Player Boxes */}
                <div className="space-y-2">
                  {team2 && renderPlayerSlotCard(team2, 'player1')}
                  {team2 && renderPlayerSlotCard(team2, 'player2')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Set Breakdown Banner if Best of 3 sets played */}
        {match?.sets && match.sets.length > 0 && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-bold">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Set Breakdown (Best of 3):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono">
              {match.sets.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-black text-emerald-400 shadow-sm"
                >
                  Set {idx + 1}: <span className="text-cyan-300">{s.team1Score}</span> - <span className="text-purple-300">{s.team2Score}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Winner Banner */}
        {winnerTeam && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-2xl text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span>Winner: {winnerTeam.name} ({winnerTeam.player1.displayName} & {winnerTeam.player2.displayName})</span>
          </div>
        )}

        {/* Score Control */}
        {match && (
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setShowScoreModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> {match.status === 'completed' ? 'Edit Match Score' : 'Record Final Set Score'}
            </button>
          </div>
        )}
      </div>

      {/* Score Modal */}
      {showScoreModal && match && (
        <ScoreEntryModal
          match={match}
          teamsMap={teamsMap}
          isAdmin={true}
          onSaveScore={(mId, s1, s2, sets) => recordMatchScoreAction(event.id, mId, s1, s2, sets)}
          onClose={() => setShowScoreModal(false)}
        />
      )}

      {showManageVenuesModal && (
        <ManageVenuesModal
          initialEditFacilityId={event.facilityId}
          onClose={() => setShowManageVenuesModal(false)}
        />
      )}

      {showAdminAddPlayerModal && (
        <AdminAddPlayerModal
          event={event}
          onClose={() => setShowAdminAddPlayerModal(false)}
        />
      )}
    </div>
  );

  // Swap logic for player slots
  function executePlayerSwap(source: TargetLocation, target: TargetLocation) {
    if (source.teamId === target.teamId && source.slot === target.slot) {
      setSelectedForSwap(null);
      return;
    }

    const newTeams: Team[] = event.teams.map((t) => ({ ...t }));
    const sourceTeam = newTeams.find((t) => t.id === source.teamId);
    const targetTeam = newTeams.find((t) => t.id === target.teamId);

    if (!sourceTeam || !targetTeam) return;

    const sourcePlayer: TeamMember = sourceTeam[source.slot];
    const targetPlayer: TeamMember = targetTeam[target.slot];

    if (!sourcePlayer || !targetPlayer) return;

    if (source.teamId === target.teamId) {
      sourceTeam.player1 = targetPlayer;
      sourceTeam.player2 = sourcePlayer;
    } else {
      sourceTeam[source.slot] = targetPlayer;
      targetTeam[target.slot] = sourcePlayer;

      const getFirstName = (name: string) => (name ? name.split(' ')[0] : '');
      sourceTeam.name = `${getFirstName(sourceTeam.player1.displayName)} & ${getFirstName(sourceTeam.player2.displayName)}`;
      targetTeam.name = `${getFirstName(targetTeam.player1.displayName)} & ${getFirstName(targetTeam.player2.displayName)}`;
    }

    updateTeams(event.id, newTeams);

    const message = `Swapped ${sourcePlayer.displayName.split(' ')[0]} ↔ ${targetPlayer.displayName.split(' ')[0]}`;
    setSwapNotice(message);
    setTimeout(() => setSwapNotice(null), 3000);

    setDraggedLocation(null);
    setDragOverLocation(null);
    setSelectedForSwap(null);
  }

  function handleCardClick(teamId: string, slot: PlayerSlot) {
    if (!isAdmin) return;
    if (!selectedForSwap) {
      setSelectedForSwap({ teamId, slot });
    } else if (selectedForSwap.teamId === teamId && selectedForSwap.slot === slot) {
      setSelectedForSwap(null);
    } else {
      executePlayerSwap(selectedForSwap, { teamId, slot });
    }
  }

  function renderPlayerSlotCard(team: Team, slot: PlayerSlot) {
    const player: TeamMember = team[slot];
    if (!player) return null;

    const isSlotDragged = draggedLocation?.teamId === team.id && draggedLocation?.slot === slot;
    const isSlotDragOver = dragOverLocation?.teamId === team.id && dragOverLocation?.slot === slot;
    const isSlotSelected = selectedForSwap?.teamId === team.id && selectedForSwap?.slot === slot;
    const isP1 = slot === 'player1';

    return (
      <div
        draggable={isAdmin}
        onDragStart={(e) => {
          if (!isAdmin) return;
          e.dataTransfer.setData('application/json', JSON.stringify({ teamId: team.id, slot }));
          e.dataTransfer.effectAllowed = 'move';
          setDraggedLocation({ teamId: team.id, slot });
        }}
        onDragOver={(e) => {
          if (!isAdmin) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (dragOverLocation?.teamId !== team.id || dragOverLocation?.slot !== slot) {
            setDragOverLocation({ teamId: team.id, slot });
          }
        }}
        onDragLeave={() => {
          if (!isAdmin) return;
          if (dragOverLocation?.teamId === team.id && dragOverLocation?.slot === slot) {
            setDragOverLocation(null);
          }
        }}
        onDrop={(e) => {
          if (!isAdmin) return;
          e.preventDefault();
          let source = draggedLocation;
          try {
            const dataStr = e.dataTransfer.getData('application/json');
            if (dataStr) source = JSON.parse(dataStr);
          } catch (err) {}
          if (source) {
            executePlayerSwap(source, { teamId: team.id, slot });
          }
        }}
        onDragEnd={() => {
          setDraggedLocation(null);
          setDragOverLocation(null);
        }}
        onClick={() => handleCardClick(team.id, slot)}
        className={`p-3 rounded-xl border transition-all duration-150 select-none flex items-center justify-between ${
          isAdmin ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
          isSlotSelected
            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-[1.01]'
            : isSlotDragOver
            ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/60 scale-[1.02]'
            : isSlotDragged
            ? 'bg-slate-950/40 border-dashed border-emerald-500/50 opacity-40'
            : 'bg-slate-900 hover:bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isAdmin && (
            <div className="text-slate-600 hover:text-slate-300 p-0.5 rounded cursor-grab shrink-0" title="Drag to swap player">
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          <div
            className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-[11px] shrink-0 border ${
              isP1
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
            }`}
          >
            {isP1 ? 'P1' : 'P2'}
          </div>

          <div className="truncate">
            <p className="font-extrabold text-white truncate text-xs">{player.displayName}</p>
            {player.isGuest && (
              <span className="text-[10px] text-purple-400 font-semibold">Guest Player</span>
            )}
          </div>
        </div>

        {isAdmin && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors shrink-0 ${
              isSlotSelected
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {isSlotSelected ? 'Selected' : 'Swap'}
          </span>
        )}
      </div>
    );
  }
};
