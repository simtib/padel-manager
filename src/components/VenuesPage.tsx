import React from 'react';
import { usePadel } from '../context/PadelContext';
import { MapPin, Star, Plus, Edit2, Trash2, ExternalLink, Check, Building2, Map } from 'lucide-react';
import { useVenueManager } from './venues/useVenueManager';

export const VenuesPage: React.FC = () => {
  const { facilities, saveFacility, toggleFavoriteFacility, deleteFacility } = usePadel();

  const { isEditing, setIsEditing, editingId, name, setName, address, setAddress,
    city, setCity, googleMapsUrl, setGoogleMapsUrl, isFavorite, setIsFavorite,
    courtCount, setCourtCount, startCreate: handleStartCreate,
    startEdit: handleStartEdit, submit: handleSubmit, sortedFacilities,
  } = useVenueManager({ facilities, saveFacility });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
            Venues
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your favorite padel clubs and location map links
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleStartCreate}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Venue
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 font-display">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {editingId ? 'Edit Venue Details' : 'Add New Favorite Venue'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Back to List
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                Venue Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dubai Padel Club"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
              >
                <option value="Dubai">Dubai</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
                <option value="Al Ain">Al Ain</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              Street Address / Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Al Quoz Industrial Area 3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Map className="w-4 h-4 text-emerald-400" /> Map / Directions Link (Free Box)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Google Maps or Apple Maps URL</span>
            </label>
            <input
              type="url"
              placeholder="e.g. https://maps.google.com/?q=Dubai+Padel+Club"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full bg-slate-950 border border-emerald-500/40 focus:border-emerald-400 text-white rounded-xl p-3 text-sm outline-none shadow-inner"
            />
            <p className="text-[11px] text-slate-400">
              Paste any Google Maps link or location pin URL here. Players can click this in tournament view to get direct turn-by-turn navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                Number of Courts
              </label>
              <select
                value={courtCount}
                onChange={(e) => setCourtCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:border-emerald-500 outline-none"
              >
                {[2, 4, 6, 8, 10, 12, 16].map((num) => (
                  <option key={num} value={num}>
                    {num} Courts
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Save as Favorite Venue
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Venue
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-medium">
            {facilities.length} Saved Facilities ({facilities.filter((f) => f.isFavorite).length} Starred Favorites)
          </p>

          {sortedFacilities.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-white text-base">No Venues Yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Add your first padel venue to start building your favorites list.
              </p>
              <button
                onClick={handleStartCreate}
                className="bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl inline-flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Add Your First Venue
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedFacilities.map((fac) => (
                <div
                  key={fac.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    fac.isFavorite
                      ? 'bg-slate-900 border-amber-500/30 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavoriteFacility(fac.id)}
                        className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                        title={fac.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            fac.isFavorite
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600 hover:text-amber-400'
                          }`}
                        />
                      </button>

                      <h4 className="font-extrabold text-white text-sm font-display">{fac.name}</h4>

                      {fac.isFavorite && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          Favorite ⭐
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1 pl-6">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {fac.address}, {fac.city} • {fac.courts.length} Courts
                    </p>

                    {fac.googleMapsUrl && (
                      <div className="pl-6 pt-1">
                        <a
                          href={fac.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Map Location
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleStartEdit(fac)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors"
                      title="Edit venue & map link"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {facilities.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${fac.name}" from saved venues?`)) {
                            deleteFacility(fac.id);
                          }
                        }}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        title="Delete venue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
