'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { PadelProvider, usePadel } from './context/PadelContext';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { TournamentDetailContainer } from './components/TournamentDetail/TournamentDetailContainer';
import { NormalMatchDetail } from './components/NormalMatchDetail';
import { GroupsPage } from './components/GroupsPage';
import { VenuesPage } from './components/VenuesPage';
import { ProfilePage } from './components/ProfilePage';
import { PlayerGroup } from './types';
import { Trophy, Search, Plus, History, ChevronDown } from 'lucide-react';

const CreateEventModal = dynamic(() =>
  import('./components/CreateEventModal').then((module) => module.CreateEventModal)
);
const AuthModal = dynamic(() =>
  import('./components/AuthModal').then((module) => module.AuthModal)
);
const GroupInviteModal = dynamic(() =>
  import('./components/GroupInviteModal').then((module) => module.GroupInviteModal)
);

function PadelAppContent() {
  const { events, currentUser, facilities, playerGroups } = usePadel();

  const [activeTab, setActiveTab] = useState<'games' | 'venues' | 'groups' | 'profile'>('games');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tournament' | 'normal_match'>('all');
  const [showPastEvents, setShowPastEvents] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [inviteGroup, setInviteGroup] = useState<PlayerGroup | null>(null);
  const [inviteSharerId, setInviteSharerId] = useState<string | undefined>(undefined);

  // Check URL parameters for group invite link (e.g., ?group=grp_123 or /group/grp_123 or #group=grp_123)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashString = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
      const hashParams = new URLSearchParams(hashString);

      let groupIdParam =
        searchParams.get('group') ||
        searchParams.get('groupId') ||
        hashParams.get('group') ||
        hashParams.get('groupId');

      const sharerParam = searchParams.get('sharer') || hashParams.get('sharer') || undefined;
      const ownerParam = searchParams.get('owner') || hashParams.get('owner') || undefined;

      if (!groupIdParam && window.location.pathname.includes('/group/')) {
        groupIdParam = window.location.pathname.split('/group/')[1]?.split('?')[0]?.split('#')[0];
      }

      if (groupIdParam) {
        setInviteSharerId(sharerParam);
        let foundGroup = playerGroups.find((g) => g.id === groupIdParam);

        if (!foundGroup) {
          const nameParam = searchParams.get('name') || hashParams.get('name') || 'Padel Group';
          const descParam = searchParams.get('desc') || hashParams.get('desc') || '';

          foundGroup = {
            id: groupIdParam,
            name: nameParam,
            description: descParam,
            ownerId: ownerParam || 'usr_organizer',
            memberIds: ['usr_john', 'usr_ahmed'],
            createdAt: new Date().toISOString(),
          };
        }

        if (foundGroup) {
          setInviteGroup(foundGroup);
          setActiveTab('groups');
          setSelectedEventId(null);
        }
      }
    } catch (err) {
      console.error('Error parsing group invite URL:', err);
    }
  }, [playerGroups]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId),
    [events, selectedEventId]
  );

  // Filter events list
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (selectedFacilityFilter !== 'all' && e.facilityId !== selectedFacilityFilter) return false;
      if (!query) return true;

      return e.name.toLowerCase().includes(query)
        || e.facilityName.toLowerCase().includes(query)
        || e.ownerName.toLowerCase().includes(query);
    });
  }, [events, searchQuery, selectedFacilityFilter, typeFilter]);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = Date.now();
    const upcoming: typeof filteredEvents = [];
    const past: typeof filteredEvents = [];

    filteredEvents.forEach((event) => {
      const timestamp = new Date(`${event.date}T${event.startTime || '23:59'}`).getTime();
      if (Number.isFinite(timestamp) && timestamp < now) past.push(event);
      else upcoming.push(event);
    });

    upcoming.sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    past.sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));
    return { upcomingEvents: upcoming, pastEvents: past };
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedEventId(null);
        }}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onSelectEvent={(id) => setSelectedEventId(id)}
      />

      {/* Body Content */}
      <main className="flex-1 pb-16">
        {/* If an Event / Tournament is selected */}
        {selectedEvent ? (
          selectedEvent.type === 'tournament' ? (
            <TournamentDetailContainer
              event={selectedEvent}
              onBack={() => setSelectedEventId(null)}
            />
          ) : (
            <div className="py-8 px-4">
              <NormalMatchDetail
                event={selectedEvent}
                onBack={() => setSelectedEventId(null)}
                currentUserId={currentUser.id}
              />
            </div>
          )
        ) : activeTab === 'venues' ? (
          <VenuesPage />
        ) : activeTab === 'groups' ? (
          <GroupsPage />
        ) : activeTab === 'profile' ? (
          <ProfilePage />
        ) : (
          /* Tournaments / Events List View */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Hero Header + Filters */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative shadow-2xl overflow-hidden space-y-5">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl space-y-1 relative z-10">
                <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight">
                  Games List
                </h1>
                <p className="text-xs text-slate-400">Search and filter games across the UAE</p>
              </div>

              <div className="flex flex-col md:flex-row gap-3 items-center justify-between relative z-10">
                {/* Search input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search tournaments or venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Event Formats</option>
                    <option value="tournament">Tournaments</option>
                    <option value="normal_match">Normal 2v2 Matches</option>
                  </select>

                  <select
                    value={selectedFacilityFilter}
                    onChange={(e) => setSelectedFacilityFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl p-2.5 outline-none focus:border-emerald-500"
                  >
                    <option value="all">All UAE Facilities</option>
                    {facilities
                      .filter((f) => f.isFavorite)
                      .map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          ⭐ {fac.name} ({fac.city})
                        </option>
                      ))}
                    {facilities
                      .filter((f) => !f.isFavorite)
                      .map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} ({fac.city})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Events Grid */}
            {upcomingEvents.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="font-bold text-white text-base">No Upcoming Events Found</p>
                <p className="text-xs max-w-sm mx-auto">
                  Try adjusting your filters or create a new private padel game or tournament.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl inline-flex items-center gap-2 mt-2"
                >
                  <Plus className="w-4 h-4" /> Create Tournament Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={(id) => setSelectedEventId(id)}
                    currentUserId={currentUser.id}
                  />
                ))}
              </div>
            )}

            {pastEvents.length > 0 && (
              <section className="border-t border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={() => setShowPastEvents((visible) => !visible)}
                  className="w-full flex items-center justify-between bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-left transition-colors"
                  aria-expanded={showPastEvents}
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <History className="w-4 h-4 text-slate-400" /> Past Events
                    <span className="text-[11px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      {pastEvents.length}
                    </span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showPastEvents ? 'rotate-180' : ''}`} />
                </button>

                {showPastEvents && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5 opacity-80">
                    {pastEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onSelect={(id) => setSelectedEventId(id)}
                        currentUserId={currentUser.id}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSelectEvent={(id) => {
            setSelectedEventId(id);
            setActiveTab('games');
          }}
        />
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Group Invite Modal from Shared Link */}
      {inviteGroup && (
        <GroupInviteModal
          group={inviteGroup}
          sharerId={inviteSharerId}
          onClose={() => {
            setInviteGroup(null);
            if (window.history.replaceState) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }}
          onJoinedSuccess={() => {
            setInviteGroup(null);
            setActiveTab('groups');
            setSelectedEventId(null);
            if (window.history.replaceState) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PadelProvider>
      <PadelAppContent />
    </PadelProvider>
  );
}
