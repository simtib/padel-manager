import React, { useState } from 'react';
import { EventItem, Team, TeamMember } from '../../types';
import { usePadel } from '../../context/PadelContext';
import {
  Users,
  Lock,
  Unlock,
  Shuffle,
  Check,
  Edit2,
  GripVertical,
  ArrowLeftRight,
  Sparkles,
  Info
} from 'lucide-react';

interface TeamsTabProps {
  event: EventItem;
  isOwner: boolean;
  isCoAdmin: boolean;
}

type PlayerSlot = 'player1' | 'player2';

interface TargetLocation {
  teamId: string;
  slot: PlayerSlot;
}

export const TeamsTab: React.FC<TeamsTabProps> = ({ event, isOwner, isCoAdmin }) => {
  const { generateTeams, updateTeams } = usePadel();

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamNameInput, setTeamNameInput] = useState('');

  // Drag and drop state
  const [draggedLocation, setDraggedLocation] = useState<TargetLocation | null>(null);
  const [dragOverLocation, setDragOverLocation] = useState<TargetLocation | null>(null);

  // Click-to-swap alternative for touch/accessibility
  const [selectedForSwap, setSelectedForSwap] = useState<TargetLocation | null>(null);

  // Toast / notification notice for swap actions
  const [swapNotice, setSwapNotice] = useState<string | null>(null);

  const isAdmin = isOwner || isCoAdmin;

  const handleToggleLock = (teamId: string) => {
    const updated = event.teams.map((t) =>
      t.id === teamId ? { ...t, locked: !t.locked } : t
    );
    updateTeams(event.id, updated);
  };

  const handleRenameTeam = (teamId: string) => {
    if (!teamNameInput.trim()) return;
    const updated = event.teams.map((t) =>
      t.id === teamId ? { ...t, name: teamNameInput.trim() } : t
    );
    updateTeams(event.id, updated);
    setEditingTeamId(null);
  };

  // Helper function to re-allocate / swap two player slots
  const executePlayerSwap = (source: TargetLocation, target: TargetLocation) => {
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
      // Swapping player 1 and player 2 within the same team
      sourceTeam.player1 = targetPlayer;
      sourceTeam.player2 = sourcePlayer;
    } else {
      // Swapping players across two different teams
      sourceTeam[source.slot] = targetPlayer;
      targetTeam[target.slot] = sourcePlayer;

      // Update team names to match new player combinations
      const getFirstName = (name: string) => (name ? name.split(' ')[0] : '');
      sourceTeam.name = `${getFirstName(sourceTeam.player1.displayName)} & ${getFirstName(
        sourceTeam.player2.displayName
      )}`;
      targetTeam.name = `${getFirstName(targetTeam.player1.displayName)} & ${getFirstName(
        targetTeam.player2.displayName
      )}`;
    }

    updateTeams(event.id, newTeams);

    const message = `Swapped ${sourcePlayer.displayName.split(' ')[0]} ↔ ${targetPlayer.displayName.split(' ')[0]}`;
    setSwapNotice(message);
    setTimeout(() => setSwapNotice(null), 4000);

    // Reset interaction states
    setDraggedLocation(null);
    setDragOverLocation(null);
    setSelectedForSwap(null);
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, teamId: string, slot: PlayerSlot) => {
    if (!isAdmin) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ teamId, slot }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLocation({ teamId, slot });
  };

  const handleDragOver = (e: React.DragEvent, teamId: string, slot: PlayerSlot) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverLocation?.teamId !== teamId || dragOverLocation?.slot !== slot) {
      setDragOverLocation({ teamId, slot });
    }
  };

  const handleDragLeave = (e: React.DragEvent, teamId: string, slot: PlayerSlot) => {
    if (!isAdmin) return;
    if (dragOverLocation?.teamId === teamId && dragOverLocation?.slot === slot) {
      setDragOverLocation(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetTeamId: string, targetSlot: PlayerSlot) => {
    if (!isAdmin) return;
    e.preventDefault();

    let source = draggedLocation;
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        source = JSON.parse(dataStr);
      }
    } catch (err) {
      // Fall back to state
    }

    if (source) {
      executePlayerSwap(source, { teamId: targetTeamId, slot: targetSlot });
    }
  };

  // Touch / click to swap handler
  const handleCardClick = (teamId: string, slot: PlayerSlot) => {
    if (!isAdmin) return;

    if (!selectedForSwap) {
      setSelectedForSwap({ teamId, slot });
    } else if (selectedForSwap.teamId === teamId && selectedForSwap.slot === slot) {
      setSelectedForSwap(null);
    } else {
      executePlayerSwap(selectedForSwap, { teamId, slot });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Users className="w-5 h-5 text-emerald-400" /> Tournament Teams ({event.teams.length})
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Priority 1: Preferred Partnerships • Priority 2: Auto-Paired Players
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (window.confirm('Regenerate unlocked teams? Custom locked teams will remain unchanged.')) {
                generateTeams(event.id);
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Shuffle className="w-4 h-4" /> Regenerate Unlocked Teams
          </button>
        )}
      </div>

      {/* Admin Drag & Drop Guidance Banner */}
      {isAdmin && event.teams.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0">
              <GripVertical className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                Admin Re-Allocation Enabled <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Drag and drop any player card onto another player slot to swap their team allocations. Alternatively, tap one player then tap another to swap them.
              </p>
            </div>
          </div>

          {swapNotice ? (
            <div className="bg-emerald-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 animate-bounce shrink-0 shadow-md">
              <Check className="w-4 h-4" /> {swapNotice}
            </div>
          ) : selectedForSwap ? (
            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shrink-0">
              <ArrowLeftRight className="w-4 h-4 animate-spin" /> Tap a second player to swap
              <button
                onClick={() => setSelectedForSwap(null)}
                className="ml-1 text-xs underline text-amber-400 hover:text-amber-200"
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Teams Grid */}
      {event.teams.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-bold text-white text-base font-display">No Teams Generated Yet</p>
          <p className="text-xs max-w-sm mx-auto">
            Click "Generate Teams" above to automatically pair registered players according to their preferred partner requests.
          </p>
          {isAdmin && (
            <button
              onClick={() => generateTeams(event.id)}
              className="bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl mt-2 inline-flex items-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Shuffle className="w-4 h-4" /> Generate Teams Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.teams.map((team) => (
            <div
              key={team.id}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-lg relative transition-all ${
                team.locked ? 'border-amber-500/30 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Team Title & Action */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                {editingTeamId === team.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={teamNameInput}
                      onChange={(e) => setTeamNameInput(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-white rounded-lg p-1.5 text-xs flex-1 outline-none focus:border-emerald-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameTeam(team.id)}
                      className="p-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm font-display">{team.name}</span>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setEditingTeamId(team.id);
                          setTeamNameInput(team.name);
                        }}
                        className="text-slate-500 hover:text-white p-1 transition-colors"
                        title="Rename team"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleToggleLock(team.id)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all active:scale-95 ${
                      team.locked
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={team.locked ? 'Team is locked against auto-regeneration' : 'Lock team pairing'}
                  >
                    {team.locked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" /> Locked
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Lock
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Players Slots Pair */}
              <div className="space-y-2 text-xs">
                {/* Player 1 Card */}
                {renderPlayerSlotCard(team, 'player1')}

                {/* Player 2 Card */}
                {renderPlayerSlotCard(team, 'player2')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render individual player slot card with drag & drop listeners
  function renderPlayerSlotCard(team: Team, slot: PlayerSlot) {
    const player: TeamMember = team[slot];
    const isSlotDragged = draggedLocation?.teamId === team.id && draggedLocation?.slot === slot;
    const isSlotDragOver = dragOverLocation?.teamId === team.id && dragOverLocation?.slot === slot;
    const isSlotSelected = selectedForSwap?.teamId === team.id && selectedForSwap?.slot === slot;

    const isP1 = slot === 'player1';

    return (
      <div
        draggable={isAdmin}
        onDragStart={(e) => handleDragStart(e, team.id, slot)}
        onDragOver={(e) => handleDragOver(e, team.id, slot)}
        onDragLeave={(e) => handleDragLeave(e, team.id, slot)}
        onDrop={(e) => handleDrop(e, team.id, slot)}
        onDragEnd={() => {
          setDraggedLocation(null);
          setDragOverLocation(null);
        }}
        onClick={() => handleCardClick(team.id, slot)}
        className={`p-3 rounded-xl border transition-all duration-150 select-none flex items-center justify-between ${
          isAdmin ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
          isSlotSelected
            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.01]'
            : isSlotDragOver
            ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-400/60 shadow-xl scale-[1.02] translate-y-[-1px]'
            : isSlotDragged
            ? 'bg-slate-950/40 border-dashed border-emerald-500/50 opacity-40'
            : 'bg-slate-950 hover:bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isAdmin && (
            <div
              className="text-slate-600 hover:text-slate-300 p-0.5 rounded cursor-grab shrink-0"
              title="Drag to re-allocate"
            >
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
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                isSlotSelected
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {isSlotSelected ? 'Selected' : 'Swap'}
            </span>
          </div>
        )}
      </div>
    );
  }
};

