import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { Trophy, Calendar, Edit2, Phone, Mail, X, MapPin, LogOut, Clock3, CheckCircle, Ticket } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile, events, leaveEvent, logoutAction, isAuthenticated } = usePadel();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [mobileNumber, setMobileNumber] = useState(currentUser.mobileNumber || '');

  // Filter events user is registered for
  const registeredEvents = events.filter((e) =>
    e.participants.some((p) => p.id === currentUser.id)
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      mobileNumber,
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <img
            src={currentUser.avatarUrl || 'https://i.pravatar.cc/150'}
            alt={currentUser.displayName}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/50 shadow-xl"
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white font-display">
                {currentUser.displayName}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-0.5 rounded-full uppercase">
                UAE Player 🎾
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" /> {currentUser.email}
              </span>
              {currentUser.mobileNumber && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> {currentUser.mobileNumber}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4 text-emerald-400" /> Edit Profile
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-slate-400">Events Played</p>
          <p className="text-2xl font-black text-white">{currentUser.eventsPlayed}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-slate-400">Matches Played</p>
          <p className="text-2xl font-black text-white">{currentUser.matchesPlayed}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-emerald-400">Matches Won</p>
          <p className="text-2xl font-black text-emerald-400">{currentUser.matchesWon}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-rose-400">Matches Lost</p>
          <p className="text-2xl font-black text-rose-400">{currentUser.matchesLost}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-amber-400">Win Rate %</p>
          <p className="text-2xl font-black text-amber-400">{currentUser.winRate}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-cyan-400">Games Won</p>
          <p className="text-2xl font-black text-cyan-400">{currentUser.totalGamesWon}</p>
        </div>
      </div>

      {/* Active Tournament Registrations Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-400" /> Active Registrations & Waitlists
          </h3>
          <span className="text-xs text-slate-400">
            {registeredEvents.length} Active {registeredEvents.length === 1 ? 'Event' : 'Events'}
          </span>
        </div>

        {registeredEvents.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            You are not currently registered for any upcoming tournaments or matches.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registeredEvents.map((evt) => {
              const myParticipant = evt.participants.find((p) => p.id === currentUser.id);
              const isWaitingList = myParticipant?.status === 'waiting_list';

              return (
                <div
                  key={evt.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between gap-4 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-white text-sm">{evt.name}</h4>
                      {isWaitingList ? (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock3 className="w-3 h-3" /> Waitlist #{myParticipant?.waitingListPosition || 1}
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Confirmed
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {evt.date} • {evt.startTime}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {evt.facilityName}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {evt.type.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => leaveEvent(evt.id)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Withdraw Registration
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Events Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> Recent Events & Tournament Log
        </h3>

        {currentUser.recentEvents.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">
            No recent events recorded yet. Join a tournament to build your playing statistics!
          </p>
        ) : (
          <div className="space-y-3">
            {currentUser.recentEvents.map((evt) => (
              <div
                key={evt.eventId}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">{evt.eventName}</p>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-400" /> {evt.date}
                  </p>
                </div>

                <span
                  className={`font-bold text-xs px-3 py-1 rounded-full border uppercase ${
                    evt.result === 'Champion'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : evt.result === 'Runner-Up'
                      ? 'bg-slate-700/50 text-slate-200 border-slate-600'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {evt.result === 'Champion' ? '🏆 Champion' : evt.result}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-slate-200">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-4">Edit Player Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold text-xs py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
