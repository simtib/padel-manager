import React, { useState } from 'react';
import { EventItem } from '../types';
import { usePadel } from '../context/PadelContext';
import { Users, UserPlus, X, Search, Check, Plus, Sparkles, Shield } from 'lucide-react';

interface AdminAddPlayerModalProps {
  event: EventItem;
  onClose: () => void;
}

export const AdminAddPlayerModal: React.FC<AdminAddPlayerModalProps> = ({ event, onClose }) => {
  const { allPlayers, addRegisteredPlayerToEvent, addGuestPlayer } = usePadel();

  const [activeTab, setActiveTab] = useState<'community' | 'guest'>('community');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestName, setGuestName] = useState('');
  const [addedPlayerIds, setAddedPlayerIds] = useState<string[]>([]);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const registeredParticipantIds = new Set(event.participants.map((p) => p.id));

  // Filter community players
  const filteredPlayers = allPlayers.filter((player) => {
    const matchesSearch =
      player.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.email && player.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.preferredPosition && player.preferredPosition.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleAddCommunityPlayer = (userId: string, name: string) => {
    addRegisteredPlayerToEvent(event.id, userId);
    setAddedPlayerIds((prev) => [...prev, userId]);
    showToast(`Added ${name} to event!`);
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    addGuestPlayer(event.id, guestName.trim());
    showToast(`Added guest "${guestName.trim()}" to event!`);
    setGuestName('');
  };

  const showToast = (msg: string) => {
    setAddedNotice(msg);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 relative shadow-2xl text-slate-200 mx-auto my-3 sm:my-8 max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white font-display flex items-center gap-2">
              Admin: Add Player <Shield className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400">Add community players or guests to {event.name}</p>
          </div>
        </div>

        {/* Toast Banner */}
        {addedNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 mb-4 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{addedNotice}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'community'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Community Players
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guest'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> Add Custom Guest
          </button>
        </div>

        {/* Tab 1: Community Players List */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search players by name, email, or skill..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
              />
            </div>

            {/* Players List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredPlayers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No matching players found.</div>
              ) : (
                filteredPlayers.map((player) => {
                  const isRegistered = registeredParticipantIds.has(player.id) || addedPlayerIds.includes(player.id);

                  return (
                    <div
                      key={player.id}
                      className="p-3 bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center shrink-0">
                          {player.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-white truncate">{player.displayName}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {player.skillLevel ? `Rating: ${player.skillLevel}` : ''} • {player.preferredPosition || 'Both positions'}
                          </p>
                        </div>
                      </div>

                      {isRegistered ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-xl text-[11px] flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" /> Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddCommunityPlayer(player.id, player.displayName)}
                          className="min-h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95 shrink-0 shadow-md shadow-emerald-500/10"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Add
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Guest Player */}
        {activeTab === 'guest' && (
          <form onSubmit={handleAddGuest} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Guest Display Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Carlos Alcaraz"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
                autoFocus
              />
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
              <Sparkles className="w-4 h-4 text-emerald-400 inline mr-1.5" />
              Guest players can be assigned directly to teams, court rotation schedules, and match brackets.
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!guestName.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" /> Add Guest Player
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
