import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { Facility } from '../types';
import { createClient } from '../lib/supabase/client';

// Club changes made in /admin must appear in normal event/venue selection.
export function useSupabaseFacilitySync(isAuthenticated: boolean, setFacilities: Dispatch<SetStateAction<Facility[]>>) {
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    let loading = false;
    const refresh = async () => {
      if (loading || document.visibilityState === 'hidden') return;
      loading = true;
      try {
        const rows = [];
        for (let offset = 0; active; offset += 500) {
          const { data, error } = await createClient().from('facilities').select('*, courts(*)').order('id').range(offset, offset + 499);
          if (error) throw error;
          rows.push(...data);
          if (data.length < 500) break;
        }
        if (active) setFacilities((previous) => rows.map((row) => ({
          id: row.id, name: row.name, address: row.address, city: row.city, country: row.country,
          googleMapsUrl: row.google_maps_url || '', isFavorite: previous.find((item) => item.id === row.id)?.isFavorite || false,
          courts: row.courts.filter((court) => court.is_active).sort((a, b) => a.court_number - b.court_number).map((court) => ({ id: court.id, name: court.name })),
        })));
      } catch (error) { if (active) console.error('Could not refresh clubs:', error); }
      finally { loading = false; }
    };
    const onRefresh = () => { void refresh(); };
    onRefresh();
    window.addEventListener('focus', onRefresh);
    const interval = window.setInterval(onRefresh, 15000);
    return () => { active = false; window.clearInterval(interval); window.removeEventListener('focus', onRefresh); };
  }, [isAuthenticated, setFacilities]);
}
