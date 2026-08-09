import React, { useState } from 'react';
import { EventItem } from '../../types';
import { usePadel } from '../../context/PadelContext';
import { TournamentOverview } from './TournamentOverview';
import { PlayersTab } from './PlayersTab';
import { TeamsTab } from './TeamsTab';
import { GroupsTab } from './GroupsTab';
import { GameBoardTab } from './GameBoardTab';
import { StandingsTab } from './StandingsTab';
import { KnockoutTab } from './KnockoutTab';
import { AdminsTab } from './AdminsTab';
import { ShareModal } from '../ShareModal';
import {
  Trophy,
  Users,
  LayoutGrid,
  Calendar,
  BarChart2,
  Crown,
  ShieldCheck,
  ArrowLeft,
  Info
} from 'lucide-react';

interface TournamentDetailContainerProps {
  event: EventItem;
  onBack: () => void;
}

type TabType =
  | 'overview'
  | 'players'
  | 'teams'
  | 'groups'
  | 'board'
  | 'standings'
  | 'knockout'
  | 'admins';

export const TournamentDetailContainer: React.FC<TournamentDetailContainerProps> = ({
  event,
  onBack,
}) => {
  const {
    currentUser,
    generateTeams,
    generateEventGroupsAction,
    generateEventScheduleAction,
    confirmQualifiersAndKnockout,
  } = usePadel();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showShareModal, setShowShareModal] = useState(false);

  const isOwner = event.ownerId === currentUser.id;
  const isCoAdmin = event.coAdminIds.includes(currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Events
        </button>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800/60 px-3 py-1 rounded-full uppercase tracking-wider">
          {event.facilityName}
        </span>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Info className="w-4 h-4" /> Overview
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'players'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" /> Players ({event.participants.length})
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'teams'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" /> Teams ({event.teams.length})
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'groups'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Groups ({event.groups.length})
        </button>

        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'board'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" /> Game Board
        </button>

        <button
          onClick={() => setActiveTab('standings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'standings'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Standings
        </button>

        <button
          onClick={() => setActiveTab('knockout')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'knockout'
              ? 'bg-rose-500 text-white font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-300" /> Knockout
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'admins'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Admins
        </button>
      </div>

      {/* Active Tab View Render */}
      <div>
        {activeTab === 'overview' && (
          <TournamentOverview
            event={event}
            isOwner={isOwner}
            isCoAdmin={isCoAdmin}
            onOpenShareModal={() => setShowShareModal(true)}
            onGenerateTeams={() => {
              generateTeams(event.id);
              setActiveTab('teams');
            }}
            onGenerateGroups={() => {
              generateEventGroupsAction(event.id);
              setActiveTab('groups');
            }}
            onGenerateSchedule={() => {
              generateEventScheduleAction(event.id);
              setActiveTab('board');
            }}
            onConfirmKnockouts={() => {
              confirmQualifiersAndKnockout(event.id);
              setActiveTab('knockout');
            }}
          />
        )}

        {activeTab === 'players' && (
          <PlayersTab
            event={event}
            isOwner={isOwner}
            isCoAdmin={isCoAdmin}
            currentUserId={currentUser.id}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsTab
            event={event}
            isOwner={isOwner}
            isCoAdmin={isCoAdmin}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsTab
            event={event}
            isOwner={isOwner}
            isCoAdmin={isCoAdmin}
          />
        )}

        {activeTab === 'board' && (
          <GameBoardTab
            event={event}
            isOwner={isOwner}
            isCoAdmin={isCoAdmin}
            currentUserId={currentUser.id}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsTab
            event={event}
            isOwner={isOwner}
            isCoAdmin={isCoAdmin}
            onConfirmKnockout={() => {
              confirmQualifiersAndKnockout(event.id);
              setActiveTab('knockout');
            }}
          />
        )}

        {activeTab === 'knockout' && (
          <KnockoutTab
            event={event}
            isOwner={isOwner}
            isCoAdmin={isCoAdmin}
            currentUserId={currentUser.id}
          />
        )}

        {activeTab === 'admins' && (
          <AdminsTab
            event={event}
            isOwner={isOwner}
            currentUserId={currentUser.id}
          />
        )}
      </div>

      {/* Share WhatsApp Modal */}
      {showShareModal && (
        <ShareModal event={event} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};
