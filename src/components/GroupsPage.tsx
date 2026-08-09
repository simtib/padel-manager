import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { PlayerGroup } from '../types';
import { Users, Plus, X, Share2, Link2, Check, UserPlus, Shield, UserCheck, UserX, AlertCircle, User } from 'lucide-react';
import { ShareGroupModal } from './ShareGroupModal';
import { GroupInviteModal } from './GroupInviteModal';

type ViewMode = 'players' | 'groups';

export const GroupsPage: React.FC = () => {
  const {
    playerGroups,
    allPlayers,
    currentUser,
    createPlayerGroupAction,
    joinPlayerGroupAction,
    approveGroupJoinRequestAction,
    rejectGroupJoinRequestAction,
  } = usePadel();

  const [viewMode, setViewMode] = useState<ViewMode>('groups');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  const [shareGroup, setShareGroup] = useState<PlayerGroup | null>(null);
  const [previewInviteGroup, setPreviewInviteGroup] = useState<PlayerGroup | null>(null);
  const [isNewGroupCreated, setIsNewGroupCreated] = useState(false);

  const toggleMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const newGroup = createPlayerGroupAction(groupName.trim(), description.trim(), selectedMemberIds);
    setGroupName('');
    setDescription('');
    setSelectedMemberIds([]);
    setShowCreateModal(false);

    setShareGroup(newGroup);
    setIsNewGroupCreated(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            Players
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse players and manage groups in the UAE padel community
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('players')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all ${
                viewMode === 'players'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4" /> Players
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all ${
                viewMode === 'groups'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" /> Groups
            </button>
          </div>

          {viewMode === 'groups' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Group
            </button>
          )}
        </div>
      </div>

      {/* Players View */}
      {viewMode === 'players' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-lg hover:border-slate-700 transition-all"
            >
              <img
                src={player.avatarUrl || 'https://i.pravatar.cc/150'}
                alt={player.displayName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{player.displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{player.email}</p>
                {player.mobileNumber && (
                  <p className="text-[11px] text-slate-500 truncate">{player.mobileNumber}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Groups View */}
      {viewMode === 'groups' && (
        <>
          {playerGroups.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-white text-base">No Groups Yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Create a player group to organize your padel community and share invite links.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl inline-flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Create Your First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playerGroups.map((group) => {
                const isMember = group.memberIds.includes(currentUser.id);
                const isAdmin = group.ownerId === currentUser.id;
                const pendingCount = group.pendingRequestUserIds?.length || 0;

                return (
                  <div
                    key={group.id}
                    className={`bg-slate-900 border rounded-3xl p-6 space-y-4 shadow-xl relative flex flex-col justify-between transition-all ${
                      isMember ? 'border-slate-800' : 'border-emerald-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base font-display">{group.name}</h3>
                          {isAdmin && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isMember ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Member
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              Invite Available
                            </span>
                          )}
                          <span className="bg-slate-950 text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-800">
                            {group.memberIds.length}
                          </span>
                        </div>
                      </div>

                      {group.description && (
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{group.description}</p>
                      )}

                      {/* Pending Requests Section for Admin */}
                      {isAdmin && pendingCount > 0 && (
                        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between text-amber-300">
                            <span className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
                              <AlertCircle className="w-3.5 h-3.5" /> Pending Requests ({pendingCount})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {group.pendingRequestUserIds?.map((reqUserId) => {
                              const reqPlayer = allPlayers.find((p) => p.id === reqUserId);
                              return (
                                <div
                                  key={reqUserId}
                                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-2 flex items-center justify-between gap-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={reqPlayer?.avatarUrl || 'https://i.pravatar.cc/150'}
                                      alt=""
                                      className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                    />
                                    <span className="text-xs font-bold text-white">
                                      {reqPlayer?.displayName || 'Unknown Player'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => approveGroupJoinRequestAction(group.id, reqUserId)}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all shadow"
                                    >
                                      <UserCheck className="w-3 h-3" /> Approve
                                    </button>
                                    <button
                                      onClick={() => rejectGroupJoinRequestAction(group.id, reqUserId)}
                                      className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[10px] px-2 py-1 rounded-lg border border-rose-500/30 transition-all"
                                      title="Decline request"
                                    >
                                      <UserX className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Members List */}
                      <div className="mt-4 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Group Members ({group.memberIds.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {group.memberIds.map((mId) => {
                            const player = allPlayers.find((p) => p.id === mId);
                            return (
                              <div
                                key={mId}
                                className="bg-slate-950 border border-slate-800/80 rounded-xl px-2.5 py-1 text-xs text-slate-200 flex items-center gap-1.5"
                              >
                                <img
                                  src={player?.avatarUrl || 'https://i.pravatar.cc/150'}
                                  alt=""
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                                <span>{player?.displayName || 'Member'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Share Link or Join / View Details */}
                    <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPreviewInviteGroup(group)}
                        className="bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400" /> Details
                      </button>

                      <button
                        onClick={() => {
                          setShareGroup(group);
                          setIsNewGroupCreated(false);
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs py-2.5 px-3 rounded-xl border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share Link
                      </button>
                    </div>
                  </div>
                );
              })}
             </div>
          )}
        </>
      )}

      {/* Share Group Modal */}
      {shareGroup && (
        <ShareGroupModal
          group={shareGroup}
          isNew={isNewGroupCreated}
          onClose={() => setShareGroup(null)}
        />
      )}

      {/* Invite Landing Details Modal */}
      {previewInviteGroup && (
        <GroupInviteModal
          group={previewInviteGroup}
          onClose={() => setPreviewInviteGroup(null)}
          onJoinedSuccess={() => setPreviewInviteGroup(null)}
        />
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-slate-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-1">Create Player Group</h3>
            <p className="text-xs text-slate-400 mb-4">
              Group friends together and generate a shareable invite link
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Friday Padel Crew"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al Quoz weekly padel players"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Initial Members (Optional)
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {allPlayers.map((player) => {
                    const isSelected = selectedMemberIds.includes(player.id);
                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => toggleMember(player.id)}
                        className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <img src={player.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                        {player.displayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold text-xs py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create & Get Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
