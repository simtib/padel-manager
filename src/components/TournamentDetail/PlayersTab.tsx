import React, { useState } from 'react';
import { EventItem, Participant, PartnerRequest } from '../../types';
import { usePadel } from '../../context/PadelContext';
import { AdminAddPlayerModal } from '../AdminAddPlayerModal';
import {
  Users,
  UserPlus,
  Heart,
  Check,
  X,
  Clock,
  Trash2,
  Send,
  AlertCircle,
  Plus,
  Shield
} from 'lucide-react';

interface PlayersTabProps {
  event: EventItem;
  isOwner: boolean;
  isCoAdmin: boolean;
  currentUserId: string;
}

export const PlayersTab: React.FC<PlayersTabProps> = ({
  event,
  isOwner,
  isCoAdmin,
  currentUserId,
}) => {
  const {
    allPlayers,
    joinEvent,
    leaveEvent,
    removeParticipant,
    addGuestPlayer,
    removeGuestPlayer,
    sendPartnerRequest,
    respondToPartnerRequest,
    partnerRequests,
  } = usePadel();

  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showAdminAddPlayerModal, setShowAdminAddPlayerModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  const isAdmin = isOwner || isCoAdmin;

  const confirmedParticipants = event.participants.filter((p) => p.status === 'confirmed');
  const waitingParticipants = event.participants
    .filter((p) => p.status === 'waiting_list')
    .sort((a, b) => (a.waitingListPosition || 0) - (b.waitingListPosition || 0));

  const isUserRegistered = event.participants.some((p) => p.id === currentUserId);
  const userParticipant = event.participants.find((p) => p.id === currentUserId);

  const pendingRequestsForMe = partnerRequests.filter(
    (r) => r.eventId === event.id && r.toUserId === currentUserId && r.status === 'pending'
  );

  const myOutgoingRequest = partnerRequests.find(
    (r) => r.eventId === event.id && r.fromUserId === currentUserId
  );

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    addGuestPlayer(event.id, guestName.trim());
    setGuestName('');
    setShowAddGuestModal(false);
  };

  const handleSendPartnerReq = () => {
    if (!selectedPartnerId) return;
    sendPartnerRequest(event.id, selectedPartnerId);
    setSelectedPartnerId('');
  };

  return (
    <div className="space-y-6">
      {/* Join / Registration CTA Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Player Registration Status
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {confirmedParticipants.length} of {event.maxPlayers} confirmed spots filled
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowAdminAddPlayerModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Add Player
            </button>
          )}

          {isUserRegistered ? (
            <button
              onClick={() => leaveEvent(event.id)}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              Withdraw Registration
            </button>
          ) : (
            <button
              onClick={() => joinEvent(event.id)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              {confirmedParticipants.length >= event.maxPlayers
                ? 'Join Waiting List'
                : 'Register Myself'}
            </button>
          )}

          {isUserRegistered && (
            <button
              onClick={() => setShowAddGuestModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> Add Guest Partner
            </button>
          )}
        </div>
      </div>

      {showAdminAddPlayerModal && (
        <AdminAddPlayerModal
          event={event}
          onClose={() => setShowAdminAddPlayerModal(false)}
        />
      )}

      {/* Preferred Partner Request Section */}
      {isUserRegistered && userParticipant?.status === 'confirmed' && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <h4 className="font-bold text-sm text-white">Select Preferred Partner</h4>
            </div>
            <span className="text-[11px] text-slate-400">Mutual selections are locked first during team pairing</span>
          </div>

          {/* Pending requests for me */}
          {pendingRequestsForMe.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-emerald-300 font-bold">
                🎾 {req.fromUserName} requested to pair with you as tournament partner!
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => respondToPartnerRequest(req.id, true)}
                  className="bg-emerald-500 text-slate-950 font-bold py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-emerald-400"
                >
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button
                  onClick={() => respondToPartnerRequest(req.id, false)}
                  className="bg-slate-800 text-slate-300 font-medium py-1 px-3 rounded-lg hover:bg-slate-700"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}

          {/* Send request control */}
          {myOutgoingRequest ? (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs flex items-center justify-between">
              <span className="text-slate-300">
                Partner Request Sent to: <strong className="text-emerald-400">{myOutgoingRequest.toUserName}</strong>
              </span>
              <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                myOutgoingRequest.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {myOutgoingRequest.status}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose a registered player to partner with --</option>
                {confirmedParticipants
                  .filter((p) => p.id !== currentUserId && !p.isGuest)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}
                    </option>
                  ))}
              </select>

              <button
                onClick={handleSendPartnerReq}
                disabled={!selectedPartnerId}
                className="bg-emerald-500 disabled:opacity-50 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Send Request
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmed Players Grid */}
      <div className="space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center justify-between">
          <span>Confirmed Participants ({confirmedParticipants.length})</span>
          <span className="text-xs text-slate-400 font-normal">Registered in order of arrival</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {confirmedParticipants.map((participant, idx) => {
            const playerProfile = allPlayers.find((p) => p.id === participant.id);
            const avatar = playerProfile?.avatarUrl || `https://i.pravatar.cc/150?u=${participant.id}`;

            return (
              <div
                key={participant.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold text-xs w-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <img
                    src={avatar}
                    alt={participant.displayName}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      {participant.displayName}
                      {participant.isGuest && (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] px-1.5 py-0.2 rounded">
                          Guest
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Registered {new Date(participant.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {(participant.id === currentUserId || (participant.isGuest && participant.addedByUserId === currentUserId) || isOwner || isCoAdmin) && (
                  <button
                    onClick={() => removeParticipant(event.id, participant.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors rounded-lg hover:bg-rose-500/10"
                    title={`Remove ${participant.displayName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting List Section */}
      {waitingParticipants.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Waiting List ({waitingParticipants.length})
            </h4>
            <span className="text-xs text-slate-400">
              Automatically promoted in order if a player withdraws
            </span>
          </div>

          <div className="space-y-2">
            {waitingParticipants.map((p) => (
              <div
                key={p.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/20 text-amber-400 font-extrabold text-[11px] px-2 py-0.5 rounded-md">
                    #{p.waitingListPosition}
                  </span>
                  <span className="font-bold text-white">{p.displayName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[10px]">On standby</span>
                  {(p.id === currentUserId || (p.isGuest && p.addedByUserId === currentUserId) || isOwner || isCoAdmin) && (
                    <button
                      onClick={() => removeParticipant(event.id, p.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors rounded hover:bg-rose-500/10"
                      title={`Remove ${p.displayName} from waiting list`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl text-slate-200">
            <button
              onClick={() => setShowAddGuestModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-1">Add Guest Player</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a non-registered partner or friend to this tournament.
            </p>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marco Rossi"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-md"
                >
                  Add Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
