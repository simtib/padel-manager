import React, { useState } from 'react';
import { EventItem, Match, Team } from '../../types';
import { ScoreEntryModal } from '../ScoreEntryModal';
import { usePadel } from '../../context/PadelContext';
import { Calendar, Clock, MapPin, Trophy, Play, CheckCircle, Edit3, PlusCircle, RefreshCw } from 'lucide-react';

interface GameBoardTabProps {
  event: EventItem;
  isOwner: boolean;
  isCoAdmin: boolean;
  currentUserId: string;
}

export const GameBoardTab: React.FC<GameBoardTabProps> = ({
  event,
  isOwner,
  isCoAdmin,
  currentUserId,
}) => {
  const { recordMatchScoreAction, generateEventScheduleAction } = usePadel();
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number | 'all'>('all');
  const [selectedMatchForScore, setSelectedMatchForScore] = useState<Match | null>(null);

  const isAdmin = isOwner || isCoAdmin;

  const teamsMap: Record<string, Team> = {};
  event.teams.forEach((t) => {
    teamsMap[t.id] = t;
  });

  const groupMatches = event.matches.filter((m) => m.stage === 'group');

  const filteredMatches = selectedRoundFilter === 'all'
    ? groupMatches
    : groupMatches.filter((m) => m.round === selectedRoundFilter);

  const roundsList = [1, 2, 3];

  return (
    <div className="space-y-6">
      {/* Header Filters & Admin Match Creation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Trophy className="w-5 h-5 text-emerald-400" /> Game Board & Match Schedule
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Group round-robin fixtures rotated across assigned courts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Create / Regenerate Matches Button */}
          {isAdmin && (
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
              disabled={event.groups.length === 0}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
              title={event.groups.length === 0 ? 'Create groups first in the Groups tab' : 'Generate matches for all groups'}
            >
              {groupMatches.length > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4" /> Regenerate Matches
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" /> Create Matches
                </>
              )}
            </button>
          )}

          {/* Round Filter Tabs */}
          {groupMatches.length > 0 && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setSelectedRoundFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedRoundFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Rounds
              </button>
              {roundsList.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoundFilter(r)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    selectedRoundFilter === r
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Round {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {groupMatches.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 shadow-xl">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-white text-base font-display">No Matches Scheduled Yet</p>
            {event.groups.length > 0 ? (
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Your tournament groups are set! Click below to automatically generate round-robin matches across assigned courts.
              </p>
            ) : (
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Please create tournament groups first in the <span className="text-emerald-400 font-bold">Groups</span> tab before creating matches.
              </p>
            )}
          </div>

          {isAdmin && event.groups.length > 0 && (
            <button
              onClick={() => generateEventScheduleAction(event.id)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Create Matches Now
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => {
            const team1 = teamsMap[match.team1Id];
            const team2 = teamsMap[match.team2Id];

            const isParticipantInMatch =
              team1?.player1.id === currentUserId ||
              team1?.player2.id === currentUserId ||
              team2?.player1.id === currentUserId ||
              team2?.player2.id === currentUserId;

            const canEnterScore = isOwner || isCoAdmin || isParticipantInMatch;

            return (
              <div
                key={match.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                    <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {match.courtName}
                    </span>
                    <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                      Round {match.round}
                    </span>
                  </div>

                  {/* Teams vs Score */}
                  <div className="mt-4 space-y-3">
                    {/* Team 1 */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        match.winnerTeamId === match.team1Id
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm">
                          {team1 ? team1.name : 'Team 1'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {team1 ? `${team1.player1.displayName} & ${team1.player2.displayName}` : ''}
                        </p>
                      </div>

                      <span className="text-xl font-black">
                        {typeof match.team1Score === 'number' ? match.team1Score : '-'}
                      </span>
                    </div>

                    <div className="text-center font-extrabold text-[10px] text-slate-500 tracking-wider">
                      VS
                    </div>

                    {/* Team 2 */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        match.winnerTeamId === match.team2Id
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm">
                          {team2 ? team2.name : 'Team 2'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {team2 ? `${team2.player1.displayName} & ${team2.player2.displayName}` : ''}
                        </p>
                      </div>

                      <span className="text-xl font-black">
                        {typeof match.team2Score === 'number' ? match.team2Score : '-'}
                      </span>
                    </div>

                    {/* Set Breakdown Pill if available */}
                    {match.sets && match.sets.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 font-sans">Sets:</span>
                        {match.sets.map((s, idx) => (
                          <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700/80">
                            {s.team1Score}-{s.team2Score}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score Action Button */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      match.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {match.status}
                  </span>

                  {canEnterScore && (
                    <button
                      onClick={() => setSelectedMatchForScore(match)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {match.status === 'completed' ? 'Edit Score' : 'Enter Score'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Score Entry Modal */}
      {selectedMatchForScore && (
        <ScoreEntryModal
          match={selectedMatchForScore}
          teamsMap={teamsMap}
          isAdmin={isOwner || isCoAdmin}
          defaultMode={event.format === 'custom' ? 'single_set' : 'best_of_3'}
          lockMode={event.format === 'custom'}
          onSaveScore={(mId, s1, s2, sets) => recordMatchScoreAction(event.id, mId, s1, s2, sets)}
          onClose={() => setSelectedMatchForScore(null)}
        />
      )}
    </div>
  );
};
