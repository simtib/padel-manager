import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { PlayerGroup } from '../types';
import { Users, CheckCircle2, UserPlus, X, Shield, Sparkles, AlertCircle } from 'lucide-react';

interface GroupInviteModalProps {
  group: PlayerGroup;
  sharerId?: string;
  onClose: () => void;
  onJoinedSuccess: () => void;
}

export const GroupInviteModal: React.FC<GroupInviteModalProps> = ({ group, sharerId, onClose, onJoinedSuccess }) => {
  const { allPlayers, currentUser, joinPlayerGroupAction, requestJoinPlayerGroupAction } = usePadel();
  const [joinedDirectly, setJoinedDirectly] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Check URL parameters if sharerId wasn't explicitly passed
  const effectiveSharerId = sharerId || new URLSearchParams(window.location.search).get('sharer') || undefined;

  // Link was shared by admin if sharerId matches group.ownerId (or if sharer is owner)
  const isSharerAdmin = !effectiveSharerId || effectiveSharerId === group.ownerId;

  const isAlreadyMember = group.memberIds.includes(currentUser.id);
  const isPendingRequest = group.pendingRequestUserIds?.includes(currentUser.id);
  const memberPlayers = allPlayers.filter((p) => group.memberIds.includes(p.id));

  const handleAction = () => {
    if (isSharerAdmin) {
      joinPlayerGroupAction(group.id, currentUser.id, group);
      setJoinedDirectly(true);
      setTimeout(() => {
        onJoinedSuccess();
      }, 1500);
    } else {
      requestJoinPlayerGroupAction(group.id, currentUser.id, group);
      setRequestSubmitted(true);
      setTimeout(() => {
        onJoinedSuccess();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 relative shadow-2xl text-slate-200 overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 z-10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Group Invitation
              </span>
              {isSharerAdmin ? (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin Link
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Approval Required
                </span>
              )}
            </div>
            <h2 className="font-extrabold text-xl sm:text-2xl text-white font-display mt-1">
              {group.name}
            </h2>
          </div>
        </div>

        {/* Description & Badge */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 mb-5 space-y-2 relative z-10">
          {group.description ? (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              "{group.description}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No description provided for this group.</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-900">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Member Count:
            </span>
            <span className="text-xs font-bold text-white bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              {group.memberIds.length} Players
            </span>
          </div>
        </div>

        {/* Current Members List */}
        <div className="space-y-2.5 mb-6 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Group Members ({memberPlayers.length})
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {memberPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={player.avatarUrl}
                    alt={player.displayName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{player.displayName}</span>
                      {player.id === currentUser.id && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Level {String((player as any).level || '3.5')} • {player.position || 'Flex'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono">{player.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status / Accept Button */}
        <div className="relative z-10">
          {joinedDirectly ? (
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1 animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5" /> You joined {group.name}!
              </div>
              <p className="text-xs text-slate-300">
                Adding to your Player Groups tab...
              </p>
            </div>
          ) : requestSubmitted ? (
            <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1 animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-sm">
                <Sparkles className="w-5 h-5" /> Join Request Sent!
              </div>
              <p className="text-xs text-slate-300">
                Your request has been sent to the group admin for approval.
              </p>
            </div>
          ) : isAlreadyMember ? (
            <div className="space-y-3">
              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-2.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You are already a member of this group.</span>
              </div>
              <button
                onClick={onJoinedSuccess}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Go to Player Groups Tab
              </button>
            </div>
          ) : isPendingRequest ? (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-2.5 text-amber-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Your request to join is pending approval by the group admin.</span>
              </div>
              <button
                onClick={onJoinedSuccess}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs py-3 rounded-xl border border-slate-700 transition-all"
              >
                Go to Player Groups Tab
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <button
                onClick={handleAction}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-98"
              >
                {isSharerAdmin ? (
                  <>
                    <UserPlus className="w-4 h-4" /> Accept Invite & Join Group
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Request to Join Group (Requires Admin Approval)
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all"
              >
                Decline / Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
