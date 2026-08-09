import React from 'react';
import { EventItem, Team } from '../../types';
import { calculateGroupStandings } from '../../utils/engine';
import { Trophy, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface StandingsTabProps {
  event: EventItem;
  isOwner: boolean;
  isCoAdmin: boolean;
  onConfirmKnockout: () => void;
}

export const StandingsTab: React.FC<StandingsTabProps> = ({
  event,
  isOwner,
  isCoAdmin,
  onConfirmKnockout,
}) => {
  const teamsMap: Record<string, Team> = {};
  event.teams.forEach((t) => {
    teamsMap[t.id] = t;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Group Standings & Qualification
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Points System: Win = {event.rules.winPoints} pts | Draw = {event.rules.drawPoints} pts | Loss = {event.rules.lossPoints} pts
          </p>
        </div>

        {(isOwner || isCoAdmin) && (
          <button
            onClick={onConfirmKnockout}
            className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-extrabold text-xs py-2.5 px-5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Confirm Qualifiers & Launch Knockout Stage
          </button>
        )}
      </div>

      {event.groups.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-bold text-white text-base">No Standings Available</p>
          <p className="text-xs max-w-sm mx-auto">
            Group standings will appear automatically once groups and matches are generated.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {event.groups.map((group) => {
            const standings = calculateGroupStandings(group, event.matches, teamsMap, event.rules);

            return (
              <div
                key={group.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Group Header */}
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-base font-display">
                    {group.name} Standings
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    Top {event.rules.qualifiersPerGroup} teams qualify for Knockouts
                  </span>
                </div>

                {/* Mobile Responsive Table Container */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/60 text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4 w-10">Pos</th>
                        <th className="py-3 px-4">Team & Players</th>
                        <th className="py-3 px-2 text-center">P</th>
                        <th className="py-3 px-2 text-center">W</th>
                        <th className="py-3 px-2 text-center">D</th>
                        <th className="py-3 px-2 text-center">L</th>
                        <th className="py-3 px-2 text-center">GF</th>
                        <th className="py-3 px-2 text-center">GA</th>
                        <th className="py-3 px-2 text-center">Diff</th>
                        <th className="py-3 px-4 text-center font-bold text-emerald-400">Pts</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {standings.map((st, posIdx) => (
                        <tr
                          key={st.teamId}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            st.qualified ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-400">
                            #{posIdx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-white text-sm">{st.teamName}</p>
                            <p className="text-[10px] text-slate-400">{st.playerNames}</p>
                          </td>
                          <td className="py-3 px-2 text-center font-semibold">{st.played}</td>
                          <td className="py-3 px-2 text-center text-emerald-400 font-bold">{st.won}</td>
                          <td className="py-3 px-2 text-center">{st.drawn}</td>
                          <td className="py-3 px-2 text-center text-rose-400">{st.lost}</td>
                          <td className="py-3 px-2 text-center">{st.gamesFor}</td>
                          <td className="py-3 px-2 text-center">{st.gamesAgainst}</td>
                          <td
                            className={`py-3 px-2 text-center font-bold ${
                              st.difference > 0
                                ? 'text-emerald-400'
                                : st.difference < 0
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {st.difference > 0 ? `+${st.difference}` : st.difference}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-emerald-400 text-sm">
                            {st.points}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {st.qualified ? (
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                Qualified
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">In Group</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tiebreak Ranking Rules Footer Note */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-200">Tiebreak Order Configuration:</p>
        <p>1. Total Tournament Points → 2. Total Matches Won → 3. Game Difference → 4. Games For → 5. Head-to-Head Result</p>
      </div>
    </div>
  );
};
