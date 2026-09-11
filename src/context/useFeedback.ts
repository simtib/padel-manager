import { useCallback, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';
import { ensureProfile } from './authProfile';
import type { FeedbackItem } from '../types';
import type { Database } from '../types/database.types';

const mapFeedback = (row: Database['public']['Tables']['feedback']['Row']): FeedbackItem => ({
  id: row.id, userId: row.user_id, type: row.type as FeedbackItem['type'],
  title: row.title, description: row.description, pageRoute: row.page_route || undefined,
  status: row.status as FeedbackItem['status'], contactConsent: !!row.contact_consent,
  createdAt: row.created_at,
});

export function useFeedback(isAuthenticated: boolean, currentUserId: string) {
  const [role, setRole] = useState({ userId: '', admin: false });
  useEffect(() => {
    if (!isAuthenticated) { setRole({ userId: '', admin: false }); return; }
    let active = true;
    const refresh = async () => {
      try {
        const { data, error } = await createClient().rpc('is_app_admin');
        if (active) setRole({ userId: currentUserId, admin: !error && data === true });
      } catch {
        if (active) setRole({ userId: currentUserId, admin: false });
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [isAuthenticated, currentUserId]);

  const fetchFeedback = useCallback(async (scope: 'mine' | 'all'): Promise<FeedbackItem[]> => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Please sign in to view feedback.');
    if (scope === 'all') {
      const { data, error } = await supabase.rpc('is_app_admin');
      if (error || data !== true) throw new Error('Only application administrators can manage feedback.');
    }
    const items: FeedbackItem[] = [];
    for (let offset = 0; ; offset += 500) {
      let query = supabase.from('feedback').select('*')
        .order('created_at', { ascending: false }).order('id').range(offset, offset + 499);
      if (scope === 'mine') query = query.eq('user_id', session.user.id);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      items.push(...(data || []).map(mapFeedback));
      if (!data || data.length < 500) return items;
    }
  }, []);

  const submitFeedback = useCallback(async (input: {
    type: FeedbackItem['type']; title: string; description: string; pageRoute?: string; contactConsent: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in before submitting feedback.');
      await ensureProfile(supabase, session.user);
      const { error } = await supabase.from('feedback').insert({
        user_id: session.user.id, type: input.type, title: input.title.trim(),
        description: input.description.trim(), page_route: input.pageRoute || null,
        contact_consent: input.contactConsent, status: 'new',
      }).select('id').single();
      if (error) throw new Error(error.message);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Could not submit feedback.' };
    }
  }, []);

  const updateFeedbackStatus = useCallback(async (id: string, status: FeedbackItem['status']): Promise<boolean> => {
    const { error } = await createClient().from('feedback').update({ status }).eq('id', id).select('id').single();
    if (error) throw new Error(error.message);
    return true;
  }, []);

  return { isAppAdmin: isAuthenticated && role.userId === currentUserId && role.admin, fetchFeedback, submitFeedback, updateFeedbackStatus };
}
