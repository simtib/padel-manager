import React from 'react';
import { EventItem, TournamentGroup, Team } from '../../types';
import { usePadel } from '../../context/PadelContext';
import { LayoutGrid, ArrowRightLeft, ShieldCheck, Play, RefreshCw } from 'lucide-react';

interface GroupsTabProps {
  event: EventItem;
  isOwner: boolean;
  isCoAdmin: boolean;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ event, isOwner, isCoAdmin }) => {
  const { generateEventGroupsAction, updateGroups, generateEventScheduleAction } = usePadel();

  const isAdmin = isOwner || isCoAdmin;

  const groupMatches = event.matches.filter((m) => m.stage === 'group');

  const teamsMap: Record<string, Team> = {};
  event.teams.forEach((t) => {
    teamsMap[t.id] = t;
  });

  const handleMoveTeam = (fromGroupId: string, toGroupId: string, teamId: string) => {
    const updatedGroups = event.groups.map((g) => {
      if (g.id === fromGroupId) {
        return { ...g, teamIds: g.teamIds.filter((id) => id !== teamId) };
      }
      if (g.id === toGroupId) {
        return { ...g, teamIds: [...g.teamIds, teamId] };
      }
      return g;
    });

    updateGroups(event.id, updatedGroups);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <LayoutGrid className="w-5 h-5 text-emerald-400" /> Tournament Groups ({event.groups.length})
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            4 Teams per group • Round-robin 3 matches each
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (event.groups.length > 0) {
                  if (window.confirm('Regenerate groups? Any existing match schedules will be reset.')) {
                    generateEventGroupsAction(event.id);
                  }
                } else {
                  generateEventGroupsAction(event.id);
                }
              }}
              disabled={event.teams.length === 0}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate Groups
            </button>

            {event.groups.length > 0 && (
              <button
                onClick={() => {
                  if (groupMatches.length > 0) {
                    if (window.confirm('Regenerate all group matches? Existing scores will be reset.')) {
                      generateEventScheduleAction(event.id);
                    }
                  } else {
                    generateEventScheduleAction(event.id);
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" /> {groupMatches.length > 0 ? 'Regenerate Matches' : 'Create Matches'}
              </button>
            )}
          </div>
        )}
      </div>

      {event.groups.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-bold text-white text-base">No Groups Generated Yet</p>
          <p className="text-xs max-w-sm mx-auto">
            Once teams are generated, click "Regenerate 4-Team Groups" to split teams into groups of 4.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {event.groups.map((group) => (
            <div
              key={group.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-extrabold text-white text-base">{group.name}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                  {group.teamIds.length} Teams
                </span>
              </div>

              <div className="space-y-2.5">
                {group.teamIds.map((teamId, idx) => {
                  const team = teamsMap[teamId];
                  if (!team) return null;

                  return (
                    <div
                      key={teamId}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-500 text-xs w-4">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="font-bold text-white">{team.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {team.player1.displayName} & {team.player2.displayName}
                          </p>
                        </div>
                      </div>

                      {(isOwner || isCoAdmin) && (
                        <select
                          value={group.id}
                          onChange={(e) => handleMoveTeam(group.id, e.target.value, teamId)}
                          className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded p-1 outline-none cursor-pointer"
                        >
                          {event.groups.map((g) => (
                            <option key={g.id} value={g.id}>
                              Move to {g.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
