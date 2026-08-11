import React, { useMemo, useState } from 'react';
import { usePadel } from '../context/PadelContext';
import {
  Trophy,
  Users,
  User as UserIcon,
  PlusCircle,
  Bell,
  Check,
  X,
  LogOut,
  MapPin,
  Trash2
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'games' | 'venues' | 'groups' | 'profile';
  setActiveTab: (tab: 'games' | 'venues' | 'groups' | 'profile') => void;
  onOpenCreateModal: () => void;
  onOpenAuthModal: () => void;
  onSelectEvent: (eventId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onOpenAuthModal,
  onSelectEvent,
}) => {
  const { currentUser, isAuthenticated, notifications, clearNotifications, partnerRequests, respondToPartnerRequest, logoutAction } = usePadel();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pendingRequests = partnerRequests.filter(
    (r) => r.toUserId === currentUser.id && r.status === 'pending'
  );

  const userNotifications = useMemo(() => {
    const seenIds = new Set<string>();
    return notifications.filter((notification) => {
      if (notification.userId !== currentUser.id || seenIds.has(notification.id)) return false;
      seenIds.add(notification.id);
      return true;
    });
  }, [currentUser.id, notifications]);

  const unreadNotifs = userNotifications.filter((notification) => !notification.read);
  const totalBadges = pendingRequests.length + unreadNotifs.length;

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setActiveTab('profile');
    } else {
      onOpenAuthModal();
    }
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    await logoutAction();
    setShowProfileMenu(false);
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      onOpenAuthModal();
    } else {
      onOpenCreateModal();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('games'); }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black tracking-wider text-xl border border-emerald-400/40">
            🎾
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white font-display">
              Padel<span className="text-emerald-400">Manager</span>
            </span>
          </div>
        </div>

        {/* Primary Desktop Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'games'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" /> Games
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'groups'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" /> Players
          </button>

          <button
            onClick={() => setActiveTab('venues')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
              activeTab === 'venues'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" /> Venues
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Create Event CTA */}
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Game</span>
          </button>

          {/* Notifications Trigger */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {totalBadges > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalBadges}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" /> Notifications & Requests
                    </h4>
                    <div className="flex items-center gap-1">
                      {userNotifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-[10px] font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-white p-1"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">
                    {/* Pending Partner Requests */}
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/30 text-xs space-y-2"
                      >
                        <p className="font-semibold text-emerald-300">
                          🎾 Partner Request from {req.fromUserName}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Wants to team up as your partner for the tournament!
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              respondToPartnerRequest(req.id, true);
                            }}
                            className="flex-1 bg-emerald-500 text-slate-950 font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-400"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={() => {
                              respondToPartnerRequest(req.id, false);
                            }}
                            className="flex-1 bg-slate-700 text-slate-300 font-medium py-1 px-2 rounded-lg hover:bg-slate-600"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* General Notifications */}
                    {userNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.eventId) {
                              onSelectEvent(notif.eventId);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            notif.read
                              ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                              : 'bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          <p className="font-semibold text-white">{notif.title}</p>
                          <p className="mt-0.5 text-slate-300 text-[11px]">{notif.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}

                    {pendingRequests.length === 0 &&
                      userNotifications.length === 0 && (
                        <p className="text-xs text-slate-500 py-6 text-center">
                          No new notifications.
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Trigger / Auth */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs"
            >
              <img
                src={currentUser.avatarUrl || 'https://i.pravatar.cc/150'}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/50"
              />
              <span className="hidden lg:inline font-semibold text-slate-200 max-w-[100px] truncate">
                {currentUser.firstName}
              </span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-slate-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5" /> Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-slate-800 hover:text-rose-200 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5" /> Sign In
                    </button>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:bg-slate-800 hover:text-emerald-200 transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5" /> Create Account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 px-2 py-2 text-xs">
        <button
          onClick={() => setActiveTab('games')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'games' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Games</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'groups' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Players</span>
        </button>

        <button
          onClick={() => setActiveTab('venues')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'venues' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Venues</span>
        </button>
      </div>
    </header>
  );
};
