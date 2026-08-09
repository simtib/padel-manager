import React, { useState } from 'react';
import { EventItem } from '../../types';
import { usePadel } from '../../context/PadelContext';
import { Shield, ShieldCheck, UserPlus, Trash2, Check } from 'lucide-react';

interface AdminsTabProps {
  event: EventItem;
  isOwner: boolean;
  currentUserId: string;
}

export const AdminsTab: React.FC<AdminsTabProps> = ({ event, isOwner, currentUserId }) => {
  const { allPlayers, addCoAdmin, removeCoAdmin } = usePadel();
  const [selectedUserId, setSelectedUserId] = useState('');

  const ownerPlayer = allPlayers.find((p) => p.id === event.ownerId);

  const handleAddCoAdmin = () => {
    if (!selectedUserId) return;
    addCoAdmin(event.id, selectedUserId);
    setSelectedUserId('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" /> Event Administrators
        </h3>
        <p className="text-xs text-slate-400">
          The Game Owner can assign up to 3 Co-Admins to help manage players, teams, match schedules, court assignments, and score entry.
        </p>

        {/* Game Owner Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <img
              src={ownerPlayer?.avatarUrl || 'https://i.pravatar.cc/150'}
              alt=""
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/50"
            />
            <div>
              <p className="font-bold text-white text-sm">{event.ownerName}</p>
              <p className="text-[11px] text-slate-400">{ownerPlayer?.email}</p>
            </div>
          </div>

          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Game Owner
          </span>
        </div>

        {/* Co-Admins List */}
        <div className="space-y-2 pt-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">
            Co-Admins ({event.coAdminIds.length} / 3)
          </h4>

          {event.coAdminIds.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No co-admins assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {event.coAdminIds.map((coId) => {
                const player = allPlayers.find((p) => p.id === coId);
                return (
                  <div
                    key={coId}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player?.avatarUrl || 'https://i.pravatar.cc/150'}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-white">{player?.displayName || 'Co-Admin'}</p>
                        <p className="text-[10px] text-slate-400">{player?.email}</p>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => removeCoAdmin(event.id, coId)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900"
                        title="Remove co-admin permissions"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Co-Admin Form (Owner only) */}
        {isOwner && event.coAdminIds.length < 3 && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Assign New Co-Admin
            </label>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose player to assign --</option>
                {allPlayers
                  .filter((p) => p.id !== event.ownerId && !event.coAdminIds.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName} ({p.email})
                    </option>
                  ))}
              </select>

              <button
                onClick={handleAddCoAdmin}
                disabled={!selectedUserId}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" /> Assign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
