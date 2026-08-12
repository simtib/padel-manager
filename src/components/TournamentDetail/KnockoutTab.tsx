import React, { useState, useEffect } from 'react';
import { EventItem, Match, Team } from '../../types';
import { ScoreEntryModal } from '../ScoreEntryModal';
import { usePadel } from '../../context/PadelContext';
import confetti from 'canvas-confetti';
import { Trophy, Award, MapPin, Edit3, Crown, Sparkles } from 'lucide-react';

interface KnockoutTabProps {
  event: EventItem;
  isOwner: boolean;
  isCoAdmin: boolean;
  currentUserId: string;
}

export const KnockoutTab: React.FC<KnockoutTabProps> = ({
  event,
  isOwner,
  isCoAdmin,
  currentUserId,
}) => {
  const { recordMatchScoreAction } = usePadel();
  const [selectedMatchForScore, setSelectedMatchForScore] = useState<Match | null>(null);

  const teamsMap: Record<string, Team> = {};
  event.teams.forEach((t) => {
    teamsMap[t.id] = t;
  });

  const knockoutMatches = event.matches.filter((m) => m.stage === 'knockout');

  const qfMatches = knockoutMatches.filter((m) => m.knockoutStage === 'quarter_finals');
  const sfMatches = knockoutMatches.filter((m) => m.knockoutStage === 'semi_finals');
  const finalMatch = knockoutMatches.find((m) => m.knockoutStage === 'final');

  const winnerTeam = finalMatch?.winnerTeamId ? teamsMap[finalMatch.winnerTeamId] : null;
  const runnerTeam =
    finalMatch && finalMatch.winnerTeamId
      ? teamsMap[finalMatch.team1Id === finalMatch.winnerTeamId ? finalMatch.team2Id : finalMatch.team1Id]
      : null;

  // Trigger celebration confetti when final match is completed
  useEffect(() => {
    if (finalMatch?.status === 'completed' && winnerTeam) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [finalMatch?.status, winnerTeam?.id]);

  const renderKnockoutMatchCard = (match: Match) => {
    const team1 = teamsMap[match.team1Id];
    const team2 = teamsMap[match.team2Id];

    const isParticipant =
      team1?.player1.id === currentUserId ||
      team1?.player2.id === currentUserId ||
      team2?.player1.id === currentUserId ||
      team2?.player2.id === currentUserId;

    const canEnterScore = (isOwner || isCoAdmin || isParticipant) && (team1 && team2);

    return (
      <div
        key={match.id}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg relative flex flex-col justify-between hover:border-slate-700 transition-colors"
      >
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {match.courtName}
          </span>
          <span className="uppercase font-bold text-slate-500">
            {match.knockoutStage ? match.knockoutStage.replace('_', ' ') : 'Knockout'}
          </span>
        </div>

        <div className="space-y-2">
          {/* Team 1 */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              match.winnerTeamId && match.winnerTeamId === match.team1Id
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-white'
            }`}
          >
            <div>
              <p className="font-bold text-xs truncate max-w-[130px]">
                {team1 ? team1.name : 'TBD'}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {team1 ? `${team1.player1.displayName} & ${team1.player2.displayName}` : ''}
              </p>
            </div>
            <span className="text-lg font-black">
              {typeof match.team1Score === 'number' ? match.team1Score : '-'}
            </span>
          </div>

          {/* Team 2 */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
              match.winnerTeamId && match.winnerTeamId === match.team2Id
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-white'
            }`}
          >
            <div>
              <p className="font-bold text-xs truncate max-w-[130px]">
                {team2 ? team2.name : 'TBD'}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {team2 ? `${team2.player1.displayName} & ${team2.player2.displayName}` : ''}
              </p>
            </div>
            <span className="text-lg font-black">
              {typeof match.team2Score === 'number' ? match.team2Score : '-'}
            </span>
          </div>

          {/* Set breakdown */}
          {match.sets && match.sets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold bg-slate-950 p-1 rounded-lg border border-slate-800/80 justify-center">
              <span className="text-slate-500 font-sans">Sets:</span>
              {match.sets.map((s, idx) => (
                <span key={idx} className="bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                  {s.team1Score}-{s.team2Score}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span
            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
              match.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {match.status}
          </span>

          {canEnterScore && (
            <button
              onClick={() => setSelectedMatchForScore(match)}
              className="min-h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] py-2 px-3 rounded-lg flex items-center gap-1 shadow transition-all"
            >
              <Edit3 className="w-3 h-3" />
              {match.status === 'completed' ? 'Edit' : 'Score'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Champion Banner View */}
      {winnerTeam && (
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="inline-flex p-3 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 mb-2 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              🏆 Tournament Champions
            </span>
            <h2 className="text-3xl font-black text-white font-display mt-1">
              {winnerTeam.name}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              {winnerTeam.player1.displayName} & {winnerTeam.player2.displayName}
            </p>
          </div>

          {runnerTeam && (
            <div className="pt-4 border-t border-amber-500/20 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-slate-300" />
              <span>Runner-Up: <strong className="text-white">{runnerTeam.name}</strong> ({runnerTeam.player1.displayName} & {runnerTeam.player2.displayName})</span>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-amber-400" /> Knockout Bracket Stage
        </h3>
        <p className="text-xs text-slate-400">
          Winners automatically progress to the next knockout round
        </p>
      </div>

      {knockoutMatches.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Crown className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-bold text-white text-base">Knockouts Not Started Yet</p>
          <p className="text-xs max-w-sm mx-auto">
            Complete group stage matches and click "Start Knockout Stage" from the Standings tab to generate the bracket.
          </p>
        </div>
      ) : (
        <div className="pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-start lg:items-center">
            {/* Quarter Finals */}
            {qfMatches.length > 0 && (
              <div className="space-y-4">
                <div className="text-center font-bold text-xs text-amber-400 uppercase tracking-wider bg-slate-950 p-2 rounded-xl border border-slate-800">
                  Quarter Finals
                </div>
                <div className="space-y-4">
                  {qfMatches.map((m) => renderKnockoutMatchCard(m))}
                </div>
              </div>
            )}

            {/* Semi Finals */}
            <div className="space-y-4">
              <div className="text-center font-bold text-xs text-amber-400 uppercase tracking-wider bg-slate-950 p-2 rounded-xl border border-slate-800">
                Semi Finals
              </div>
              <div className="space-y-6 my-auto">
                {sfMatches.map((m) => renderKnockoutMatchCard(m))}
              </div>
            </div>

            {/* Final */}
            {finalMatch && (
              <div className="space-y-4">
                <div className="text-center font-bold text-xs text-amber-400 uppercase tracking-wider bg-slate-950 p-2 rounded-xl border border-amber-500/30">
                  🏆 Championship Final
                </div>
                <div className="my-auto">{renderKnockoutMatchCard(finalMatch)}</div>
              </div>
            )}
          </div>
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
