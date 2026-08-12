import React, { useState } from 'react';
import { Match, Team, SetScore } from '../types';
import { Trophy, Check, X, AlertCircle, Plus, Trash2, Sparkles, Sliders } from 'lucide-react';

interface ScoreEntryModalProps {
  match: Match;
  teamsMap: Record<string, Team>;
  onSaveScore: (matchId: string, score1: number, score2: number, sets?: SetScore[]) => void;
  onClose: () => void;
  isAdmin: boolean;
  defaultMode?: 'best_of_3' | 'single_set';
  lockMode?: boolean;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  match,
  teamsMap,
  onSaveScore,
  onClose,
  isAdmin,
  defaultMode = 'best_of_3',
  lockMode = false,
}) => {
  const team1 = teamsMap[match.team1Id];
  const team2 = teamsMap[match.team2Id];

  const team1Name = team1 ? team1.name : 'Team 1';
  const team2Name = team2 ? team2.name : 'Team 2';

  const [mode, setMode] = useState<'best_of_3' | 'single_set'>(
    match.sets && match.sets.length > 0 ? 'best_of_3' : defaultMode
  );

  // Default sets state initialized from match.sets or defaults (6-4, 6-3)
  const [sets, setSets] = useState<SetScore[]>(() => {
    if (match.sets && match.sets.length > 0) {
      return match.sets.map((s) => ({ ...s }));
    }
    return [
      { team1Score: 6, team2Score: 4 },
      { team1Score: 6, team2Score: 3 },
    ];
  });

  // Single set mode state
  const [singleScore1, setSingleScore1] = useState<number>(match.team1Score ?? 6);
  const [singleScore2, setSingleScore2] = useState<number>(match.team2Score ?? 4);

  const [error, setError] = useState<string | null>(null);

  // Set calculations
  const calculateSetsSummary = () => {
    let t1SetsWon = 0;
    let t2SetsWon = 0;

    sets.forEach((s) => {
      if (s.team1Score > s.team2Score) t1SetsWon++;
      else if (s.team2Score > s.team1Score) t2SetsWon++;
    });

    return { t1SetsWon, t2SetsWon };
  };

  const { t1SetsWon, t2SetsWon } = calculateSetsSummary();

  const handleSetChange = (index: number, team: 'team1' | 'team2', val: number) => {
    const num = Math.max(0, Math.min(30, val));
    setSets((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          [team === 'team1' ? 'team1Score' : 'team2Score']: num,
        };
      }
      return next;
    });
    setError(null);
  };

  const addSet = () => {
    if (sets.length >= 3) return;
    setSets((prev) => [...prev, { team1Score: 6, team2Score: 4 }]);
    setError(null);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const applyPreset = (presetSets: SetScore[]) => {
    setSets(presetSets);
    setMode('best_of_3');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'single_set') {
      if (singleScore1 < 0 || singleScore2 < 0) {
        setError('Scores cannot be negative.');
        return;
      }
      if (singleScore1 === singleScore2) {
        setError('A winner is required for matches (e.g. 6-4 or 7-6).');
        return;
      }
      onSaveScore(match.id, singleScore1, singleScore2);
      onClose();
      return;
    }

    // Best of 3 Sets mode validation
    if (sets.length === 0) {
      setError('Please add at least one set score.');
      return;
    }

    for (let i = 0; i < sets.length; i++) {
      const s = sets[i];
      if (s.team1Score === s.team2Score) {
        setError(`Set ${i + 1} score cannot be tied (${s.team1Score}-${s.team2Score}). Set scores must have a winner.`);
        return;
      }
    }

    if (t1SetsWon === t2SetsWon) {
      setError(
        `Match is currently tied ${t1SetsWon}-${t2SetsWon} in sets. Add a deciding 3rd set score to determine the winner!`
      );
      return;
    }

    // Save score as sets won, with full set detail
    onSaveScore(match.id, t1SetsWon, t2SetsWon, sets);
    onClose();
  };

  const getWinnerName = () => {
    if (mode === 'best_of_3') {
      if (t1SetsWon > t2SetsWon) return team1Name;
      if (t2SetsWon > t1SetsWon) return team2Name;
      return null;
    } else {
      if (singleScore1 > singleScore2) return team1Name;
      if (singleScore2 > singleScore1) return team2Name;
      return null;
    }
  };

  const winnerName = getWinnerName();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white font-display">
              {mode === 'single_set' ? 'Record Game Score (Single Set)' : 'Record Set Score (Best of 3)'}
            </h3>
            <p className="text-xs text-slate-400">
              {match.courtName} • {match.stage === 'knockout' ? `Knockout ${match.knockoutStage}` : `Round ${match.round}`}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2 mb-4 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Format Switcher */}
        {!lockMode && <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setMode('best_of_3')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'best_of_3'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Best of 3 Sets
          </button>
          <button
            type="button"
            onClick={() => setMode('single_set')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'single_set'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Single Set / Total Games
          </button>
        </div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Teams Header Bar */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center text-xs font-bold">
            <div className="text-cyan-400 truncate">
              <span className="text-[10px] text-slate-500 block uppercase">Team 1</span>
              <p className="truncate font-extrabold text-white text-sm">{team1Name}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {team1 ? `${team1.player1.displayName} & ${team1.player2.displayName}` : ''}
              </p>
            </div>
            <div className="text-purple-400 truncate">
              <span className="text-[10px] text-slate-500 block uppercase">Team 2</span>
              <p className="truncate font-extrabold text-white text-sm">{team2Name}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {team2 ? `${team2.player1.displayName} & ${team2.player2.displayName}` : ''}
              </p>
            </div>
          </div>

          {/* Mode 1: Best of 3 Sets */}
          {mode === 'best_of_3' && (
            <div className="space-y-3">
              {/* Quick Presets Bar */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Set Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset([{ team1Score: 6, team2Score: 4 }, { team1Score: 6, team2Score: 3 }])}
                    className="text-[11px] font-bold bg-slate-950 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 border border-slate-800 px-2.5 py-1 rounded-xl transition-all"
                  >
                    6-4, 6-3 (2-0)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset([{ team1Score: 4, team2Score: 6 }, { team1Score: 3, team2Score: 6 }])}
                    className="text-[11px] font-bold bg-slate-950 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 border border-slate-800 px-2.5 py-1 rounded-xl transition-all"
                  >
                    4-6, 3-6 (0-2)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset([
                        { team1Score: 6, team2Score: 4 },
                        { team1Score: 3, team2Score: 6 },
                        { team1Score: 6, team2Score: 4 },
                      ])
                    }
                    className="text-[11px] font-bold bg-slate-950 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 border border-slate-800 px-2.5 py-1 rounded-xl transition-all"
                  >
                    6-4, 3-6, 6-4 (2-1)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyPreset([
                        { team1Score: 4, team2Score: 6 },
                        { team1Score: 6, team2Score: 3 },
                        { team1Score: 4, team2Score: 6 },
                      ])
                    }
                    className="text-[11px] font-bold bg-slate-950 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 border border-slate-800 px-2.5 py-1 rounded-xl transition-all"
                  >
                    4-6, 6-3, 4-6 (1-2)
                  </button>
                </div>
              </div>

              {/* Set Input Rows */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {sets.map((set, idx) => {
                  const setWinner =
                    set.team1Score > set.team2Score
                      ? 'team1'
                      : set.team2Score > set.team1Score
                      ? 'team2'
                      : null;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-extrabold text-emerald-400 text-[11px] flex items-center justify-center shrink-0">
                          S{idx + 1}
                        </span>
                        <span className="font-bold text-white text-xs">Set {idx + 1}</span>
                      </div>

                      {/* Score Inputs */}
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={set.team1Score}
                          onChange={(e) => handleSetChange(idx, 'team1', parseInt(e.target.value) || 0)}
                          className={`w-14 h-11 text-center font-black text-lg bg-slate-900 border-2 rounded-xl outline-none transition-all ${
                            setWinner === 'team1'
                              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                              : 'border-slate-700 text-white focus:border-emerald-500'
                          }`}
                        />
                        <span className="font-extrabold text-slate-600">-</span>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={set.team2Score}
                          onChange={(e) => handleSetChange(idx, 'team2', parseInt(e.target.value) || 0)}
                          className={`w-14 h-11 text-center font-black text-lg bg-slate-900 border-2 rounded-xl outline-none transition-all ${
                            setWinner === 'team2'
                              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                              : 'border-slate-700 text-white focus:border-emerald-500'
                          }`}
                        />
                      </div>

                      {/* Remove Set Button */}
                      {sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                          title="Remove set"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Set 3 Button */}
              {sets.length < 3 && (
                <button
                  type="button"
                  onClick={addSet}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Set 3 / Tiebreak
                </button>
              )}

              {/* Sets Won Live Tally Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">Total Sets Won:</span>
                <div className="font-black text-sm flex items-center gap-3">
                  <span className={t1SetsWon > t2SetsWon ? 'text-emerald-400' : 'text-slate-300'}>
                    {team1Name}: <span className="text-emerald-400 font-extrabold">{t1SetsWon}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className={t2SetsWon > t1SetsWon ? 'text-emerald-400' : 'text-slate-300'}>
                    {team2Name}: <span className="text-emerald-400 font-extrabold">{t2SetsWon}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Single Set / Total Games */}
          {mode === 'single_set' && (
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 items-center">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team 1 Games</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={singleScore1}
                  onChange={(e) => setSingleScore1(parseInt(e.target.value) || 0)}
                  className="w-20 h-16 text-center text-2xl font-black bg-slate-900 border-2 border-slate-700 focus:border-emerald-500 text-white rounded-2xl outline-none mx-auto block shadow-inner"
                />
              </div>

              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team 2 Games</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={singleScore2}
                  onChange={(e) => setSingleScore2(parseInt(e.target.value) || 0)}
                  className="w-20 h-16 text-center text-2xl font-black bg-slate-900 border-2 border-slate-700 focus:border-emerald-500 text-white rounded-2xl outline-none mx-auto block shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Winner Preview Tag */}
          {winnerName && (
            <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-2 animate-fadeIn">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Match Winner: {winnerName}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" /> Save Score & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
