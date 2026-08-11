import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { EventFormat } from '../types';
import { Trophy, Users, MapPin, Calendar, Clock, ShieldCheck, X, Check, Info, Star, Map, ExternalLink, Settings2, Plus, RefreshCw, LayoutGrid } from 'lucide-react';
import { ManageVenuesModal } from './ManageVenuesModal';

interface CreateEventModalProps {
  onClose: () => void;
  onSelectEvent: (eventId: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSelectEvent }) => {
  const { facilities, allPlayers, currentUser, createEvent, toggleFavoriteFacility, saveFacility } = usePadel();

  const [type, setType] = useState<'tournament' | 'normal_match'>('tournament');
  const [format, setFormat] = useState<EventFormat>('custom');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState('19:00');
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [selectedCoAdminIds, setSelectedCoAdminIds] = useState<string[]>([]);
  const [showVenuesModal, setShowVenuesModal] = useState(false);

  const selectedFacility = facilities.find((f) => f.id === facilityId) || facilities[0];

  const handleFacilityChange = (id: string) => {
    setFacilityId(id);
    // Court allocation is always an explicit choice, including after changing
    // venue, so users never submit an unintended default allocation.
    setSelectedCourtIds([]);
  };

  const toggleCourt = (courtId: string) => {
    if (selectedCourtIds.includes(courtId)) {
      setSelectedCourtIds(selectedCourtIds.filter((id) => id !== courtId));
    } else {
      setSelectedCourtIds([...selectedCourtIds, courtId]);
    }
  };

  const toggleCoAdmin = (userId: string) => {
    if (selectedCoAdminIds.includes(userId)) {
      setSelectedCoAdminIds(selectedCoAdminIds.filter((id) => id !== userId));
    } else {
      if (selectedCoAdminIds.length < 3) {
        setSelectedCoAdminIds([...selectedCoAdminIds, userId]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date || (type === 'tournament' && maxPlayers === null)) return;

    const eventId = await createEvent({
      name,
      description,
      type,
      format,
      facilityId,
      courtIds: selectedCourtIds,
      date,
      startTime,
      maxPlayers: type === 'normal_match' ? 4 : maxPlayers!,
      coAdminIds: selectedCoAdminIds,
      rules: {
        winPoints: 3,
        drawPoints: 1,
        lossPoints: 0,
        tiebreakOrder: ['points', 'matchesWon', 'scoreDiff', 'scoreFor'],
        qualifiersPerGroup: 2,
      },
    });

    onSelectEvent(eventId);
    onClose();
  };

  return (
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative shadow-2xl text-slate-200 my-8 max-h-[calc(100vh-2rem)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white font-display">Organize Padel Event</h2>
            <p className="text-xs text-slate-400">Configure format, court allocation & partner rules</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Event Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Standard Game - 3 sets */}
              <button
                type="button"
                onClick={() => {
                  setFormat('standard_3_sets');
                  setType('normal_match');
                  setMaxPlayers(4);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  format === 'standard_3_sets'
                    ? 'bg-cyan-500/10 border-cyan-500 text-white ring-1 ring-cyan-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <LayoutGrid className="w-5 h-5 text-cyan-400" />
                  {format === 'standard_3_sets' && (
                    <Check className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <p className="font-bold text-sm text-white">Standard Game - 3 sets</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Best of 3 full sets match format (6-4, 4-6, tiebreak)
                </p>
              </button>

              {/* Americano */}
              <button
                type="button"
                onClick={() => {
                  setFormat('americano');
                  setType('tournament');
                  setMaxPlayers(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  format === 'americano'
                    ? 'bg-purple-500/10 border-purple-500 text-white ring-1 ring-purple-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                  {format === 'americano' && (
                    <Check className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <p className="font-bold text-sm text-white">Americano</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Individual partner rotation; total point accumulation
                </p>
              </button>

              {/* Custom */}
              <button
                type="button"
                onClick={() => {
                  setFormat('custom');
                  setType('tournament');
                  setMaxPlayers(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  format === 'custom'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Settings2 className="w-5 h-5 text-emerald-400" />
                  {format === 'custom' && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className="font-bold text-sm text-white">Custom</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Defined groups, court rotation & knockout bracket
                </p>
              </button>
            </div>
          </div>

          {/* Event Name & Description */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                placeholder={type === 'tournament' ? 'e.g. Friday Night Dubai Masters' : 'e.g. Morning 2v2 Challenge'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Details for invited players..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Venue & Courts Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Venue / Facility
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowVenuesModal(true)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Manage Venues
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={facilityId}
                    onChange={(e) => handleFacilityChange(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
                  >
                    {/* Starred Favorites First */}
                    {facilities
                      .filter((f) => f.isFavorite)
                      .map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          â­ {fac.name} ({fac.city})
                        </option>
                      ))}
                    {/* Other Facilities */}
                    {facilities
                      .filter((f) => !f.isFavorite)
                      .map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} ({fac.city})
                        </option>
                      ))}
                  </select>

                  {selectedFacility && (
                    <button
                      type="button"
                      onClick={() => toggleFavoriteFacility(selectedFacility.id)}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                      title={selectedFacility.isFavorite ? 'Saved as favorite venue' : 'Save as favorite venue'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          selectedFacility.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Date & Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500 [color-scheme:dark]"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-28 bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* FREE BOX FOR GOOGLE MAPS LINK FOR SELECTED FACILITY */}
            {selectedFacility && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5" /> Venue Map / Location Link (Free Box)
                  </label>
                  {selectedFacility.googleMapsUrl && (
                    <a
                      href={selectedFacility.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Test Link
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Paste Google Maps URL here (e.g. https://maps.google.com/?q=...)"
                  value={selectedFacility.googleMapsUrl || ''}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    saveFacility({
                      ...selectedFacility,
                      googleMapsUrl: newUrl,
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white rounded-xl p-2.5 text-xs outline-none"
                />
                <p className="text-[10px] text-slate-400">
                  {selectedFacility.address}, {selectedFacility.city} â€¢ Saved to venue profile
                </p>
              </div>
            )}
          </div>

          {/* Select Allocated Courts */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Courts Allocation <span className="text-slate-500 font-normal capitalize">(Optional)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {selectedCourtIds.length === 0 ? 'No courts assigned' : `${selectedCourtIds.length} Selected`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFacility.courts.map((court) => {
                const isSelected = selectedCourtIds.includes(court.id);
                return (
                  <button
                    key={court.id}
                    type="button"
                    onClick={() => toggleCourt(court.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {court.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Capacity (for Tournament) */}
          {type === 'tournament' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Player Capacity & Teams
                </label>
                <span className={`text-xs font-bold ${maxPlayers === null ? 'text-slate-500' : 'text-emerald-400'}`}>
                  {maxPlayers === null
                    ? 'No capacity selected'
                    : `${maxPlayers} Players (${maxPlayers / 2} Teams / ${maxPlayers / 8} Groups)`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[16, 24, 32, 48].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setMaxPlayers(cap)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      maxPlayers === cap
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cap} Players
                    <span className="block text-[10px] font-normal opacity-80">
                      {cap / 2} Teams
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Co-Admins Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Assign Co-Admins (Max 3)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Co-admins can manage teams, courts, schedule and match scores.
            </p>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
              {allPlayers
                .filter((p) => p.id !== currentUser.id)
                .map((player) => {
                  const isSelected = selectedCoAdminIds.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => toggleCoAdmin(player.id)}
                      className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3 text-purple-400" />
                      {player.displayName}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !date || (type === 'tournament' && maxPlayers === null)}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Create & Launch Event
            </button>
          </div>
        </form>

        {showVenuesModal && (
          <ManageVenuesModal
            onClose={() => setShowVenuesModal(false)}
            onSelectFacility={(facId) => {
              handleFacilityChange(facId);
              setShowVenuesModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
