import { useMemo, useState, type FormEvent } from 'react';
import type { Facility } from '../../types';

type Options = {
  facilities: Facility[];
  saveFacility: (data: Partial<Facility> & { name: string; address: string; city: string }) => Promise<Facility>;
  initialEditFacilityId?: string;
  onSaved?: (facility: Facility) => void;
};

export const useVenueManager = ({ facilities, saveFacility, initialEditFacilityId, onSaved }: Options) => {
  const initial = facilities.find((facility) => facility.id === initialEditFacilityId);
  const [isEditing, setIsEditing] = useState(Boolean(initialEditFacilityId));
  const [editingId, setEditingId] = useState<string | null>(initialEditFacilityId || null);
  const [name, setName] = useState(initial?.name || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [city, setCity] = useState(initial?.city || 'Dubai');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initial?.googleMapsUrl || '');
  const [isFavorite, setIsFavorite] = useState(initial?.isFavorite ?? true);
  const [courtCount, setCourtCount] = useState(initial?.courts.length || 4);

  const startCreate = () => {
    setEditingId(null);
    setName('');
    setAddress('');
    setCity('Dubai');
    setGoogleMapsUrl('');
    setIsFavorite(true);
    setCourtCount(4);
    setIsEditing(true);
  };

  const startEdit = (facility: Facility) => {
    setEditingId(facility.id);
    setName(facility.name);
    setAddress(facility.address);
    setCity(facility.city);
    setGoogleMapsUrl(facility.googleMapsUrl || '');
    setIsFavorite(facility.isFavorite ?? false);
    setCourtCount(facility.courts.length || 4);
    setIsEditing(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !address.trim()) return;
    const saved = await saveFacility({
      id: editingId || undefined,
      name: name.trim(),
      address: address.trim(),
      city: city.trim() || 'Dubai',
      country: 'United Arab Emirates',
      googleMapsUrl: googleMapsUrl.trim(),
      isFavorite,
      courts: Array.from({ length: courtCount }, (_, index) => ({
        id: `c_${editingId || 'new'}_${index + 1}`,
        name: `Court ${index + 1}`,
      })),
    });
    setIsEditing(false);
    setEditingId(null);
    onSaved?.(saved);
  };

  const sortedFacilities = useMemo(() => [...facilities].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return a.name.localeCompare(b.name);
  }), [facilities]);

  return {
    isEditing, setIsEditing, editingId, name, setName, address, setAddress,
    city, setCity, googleMapsUrl, setGoogleMapsUrl, isFavorite, setIsFavorite,
    courtCount, setCourtCount, startCreate, startEdit, submit, sortedFacilities,
  };
};
