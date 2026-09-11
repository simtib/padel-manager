import React, { useState, useEffect, useMemo } from 'react';
import { usePadel } from '../context/PadelContext';
import { FeedbackItem } from '../types';
import {
  MessageCircle,
  Search,
  CheckCircle,
  Clock3,
  AlertCircle,
  XCircle,
  Users,
  Calendar,
} from 'lucide-react';

const STATUS_FILTERS: { value: FeedbackItem['status'] | 'all'; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'all', label: 'All Feedback', icon: MessageCircle, color: 'text-slate-400' },
  { value: 'new', label: 'New', icon: Clock3, color: 'text-amber-400' },
  { value: 'reviewing', label: 'Reviewing', icon: Search, color: 'text-blue-400' },
  { value: 'planned', label: 'Planned', icon: Calendar, color: 'text-cyan-400' },
  { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-emerald-400' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-rose-400' },
];

const FEEDBACK_TYPE_LABELS: Record<FeedbackItem['type'], string> = {
  bug: 'Bug',
  suggestion: 'Suggestion',
  feature_request: 'Feature Request',
  other: 'Other',
};

const FEEDBACK_TYPE_COLORS: Record<FeedbackItem['type'], string> = {
  bug: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  suggestion: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  feature_request: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  other: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export const FeedbackView: React.FC<{ scope: 'mine' | 'all' }> = ({ scope }) => {
  const { fetchFeedback, updateFeedbackStatus, allPlayers, isAppAdmin } = usePadel();
  const canManage = scope === 'all' && isAppAdmin;
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [statusFilter, setStatusFilter] = useState<FeedbackItem['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchFeedback(scope).then((items) => { if (active) setFeedbackItems(items); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load feedback.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchFeedback, scope, refreshKey]);

  const filteredFeedback = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return feedbackItems.filter((f) => {
      if (statusFilter !== 'all' && f.status !== statusFilter) return false;
      if (query) {
        return (
          f.title.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query) ||
          FEEDBACK_TYPE_LABELS[f.type].toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [feedbackItems, statusFilter, searchQuery]);

  const getPlayerName = (userId: string) => {
    const player = allPlayers.find((p) => p.id === userId);
    return player ? player.displayName : 'Unknown User';
  };

  const getStatusIcon = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'new': return <Clock3 className="w-3.5 h-3.5 text-amber-400" />;
      case 'reviewing': return <Search className="w-3.5 h-3.5 text-blue-400" />;
      case 'planned': return <Calendar className="w-3.5 h-3.5 text-cyan-400" />;
      case 'done': return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  const getStatusColor = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'new': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'reviewing': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'planned': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const handleStatusChange = async (feedbackId: string, status: FeedbackItem['status']) => {
    setIsUpdating(feedbackId);
    setError('');
    try {
      await updateFeedbackStatus(feedbackId, status);
      setFeedbackItems((items) => items.map((item) => item.id === feedbackId ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update feedback.');
    } finally { setIsUpdating(null); }
  };

  const pendingCount = feedbackItems.filter((f) => f.status === 'new').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-white font-display">{scope === 'mine' ? 'My Feedback' : 'Manage Feedback'}</h1>
        </div>
        {pendingCount > 0 && (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Clock3 className="w-3.5 h-3.5" />
            {pendingCount} New
          </span>
        )}
      </div>

      <button type="button" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}
        className="text-sm text-emerald-300 disabled:opacity-50">Refresh feedback</button>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {loading && <p role="status" className="text-sm text-slate-400">Loading feedback...</p>}

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === filter.value
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-3 py-2 text-xs outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? null : filteredFeedback.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto">
            <MessageCircle className="w-6 h-6 text-slate-600" />
          </div>
          <p className="font-bold text-white text-base">No Feedback Found</p>
          <p className="text-xs max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `No feedback matching the current filter.`
              : scope === 'mine' ? 'You have not submitted feedback yet. Choose Provide Feedback from your profile menu to get started.' : 'No feedback has been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${FEEDBACK_TYPE_COLORS[item.type]}`}>
                      {FEEDBACK_TYPE_LABELS[item.type]}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(item.status)} flex items-center gap-1`}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {item.contactConsent && (
                      <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded-full">
                        Contact consent given
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>

                  {/* Description */}
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {item.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {getPlayerName(item.userId)}
                    </span>
                    {item.pageRoute && (
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {item.pageRoute}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Status changes are for application administrators only. */}
                {canManage && <select
                  aria-label={`Status for ${item.title}`}
                  value={item.status}
                  onChange={(event) => void handleStatusChange(item.id, event.target.value as FeedbackItem['status'])}
                  disabled={isUpdating === item.id}
                  className={`ml-4 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    item.status === 'done'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {STATUS_FILTERS.filter((filter) => filter.value !== 'all').map((filter) => (
                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                  ))}
                </select>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
