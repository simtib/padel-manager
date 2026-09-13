import { z } from 'zod';
import { AdminError, requireAdmin } from '../../../lib/admin';

export const dynamic = 'force-dynamic';
const uuid = z.string().uuid();
const text = (max: number) => z.string().trim().min(1).max(max);
const role = z.enum(['user', 'admin', 'super_admin']);
const mutation = z.discriminatedUnion('action', [
  z.object({ action: z.literal('profile.update'), id: uuid, first_name: text(100), last_name: z.string().trim().max(100), display_name: text(200), phone: z.string().trim().max(40) }).strict(),
  z.object({ action: z.literal('role.set'), id: uuid, role }).strict(),
  z.object({ action: z.literal('feedback.status'), id: uuid, status: z.enum(['new', 'reviewing', 'planned', 'done', 'rejected']) }).strict(),
  z.object({ action: z.literal('club.save'), id: uuid.optional(), name: text(200), address: text(500), city: text(100), country: text(100) }).strict(),
  z.object({ action: z.literal('club.delete'), id: uuid }).strict(),
  z.object({ action: z.literal('court.save'), id: uuid.optional(), facility_id: uuid, name: text(100), court_number: z.number().int().positive(), is_active: z.boolean() }).strict(),
  z.object({ action: z.literal('court.delete'), id: uuid }).strict(),
  z.object({ action: z.literal('support.create'), user_id: uuid, subject: text(200), notes: z.string().trim().max(10000) }).strict(),
  z.object({ action: z.literal('support.update'), id: uuid, subject: text(200), notes: z.string().trim().max(10000), status: z.enum(['open', 'in_progress', 'resolved']) }).strict(),
]);

function failure(error: unknown) {
  if (error instanceof AdminError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError || error instanceof SyntaxError) return Response.json({ error: 'Please check the submitted fields.' }, { status: 400 });
  console.error('Admin request failed:', error);
  return Response.json({ error: 'The operation could not be completed. Please refresh and try again.' }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const resource = z.enum(['profile', 'dashboard', 'users', 'clubs', 'feedback', 'support', 'roles']).parse(url.searchParams.get('resource') || 'dashboard');
    const page = z.coerce.number().int().min(0).max(100000).parse(url.searchParams.get('page') || 0);
    const { supabase, profile } = await requireAdmin(resource === 'roles');
    const isSuperAdmin = profile.role === 'super_admin';
    if (resource === 'profile') {
      const { data, error } = await supabase.from('profiles').select('id, first_name, last_name, display_name, email, phone, role').eq('id', profile.id).single();
      if (error) throw error;
      return Response.json({ data: [data], count: 1 }, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    if (resource === 'dashboard') {
      // 1. Fetch KPI counts
      const [usersCountRes, clubsCountRes, matchesCountRes, openFeedbackCountRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('facilities').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('feedback').select('id', { count: 'exact', head: true }).in('status', ['new', 'reviewing', 'planned']),
      ]);

      const usersCount = usersCountRes.count || 0;
      const clubsCount = clubsCountRes.count || 0;
      const matchesCount = matchesCountRes.count || 0;
      const openFeedbackCount = openFeedbackCountRes.count || 0;

      // 2. Fetch Needs Attention items
      const [newFeedback, openSupport] = await Promise.all([
        supabase.from('feedback').select('*').eq('status', 'new').order('created_at', { ascending: false }).limit(5),
        supabase.from('support_cases').select('*').in('status', ['open', 'in_progress']).order('created_at', { ascending: false }).limit(5),
      ]);

      // 3. Recent Platform Activity
      const [recentUsers, recentEvents, recentFeedback, recentRoles] = await Promise.all([
        supabase.from('profiles').select('id, display_name, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('events').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('feedback').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
        isSuperAdmin
          ? supabase.from('role_changes').select('id, old_role, new_role, created_at').order('created_at', { ascending: false }).limit(5)
          : Promise.resolve({ data: [] }),
      ]);

      // Build unified activity feed
      const activityItems: any[] = [];
      if (recentUsers.data) {
        recentUsers.data.forEach((u: any) => {
          activityItems.push({
            id: `user-${u.id}`,
            type: 'user',
            title: 'New User Registered',
            description: `Player "${u.display_name}" (${u.email}) joined`,
            timestamp: u.created_at,
          });
        });
      }
      if (recentEvents.data) {
        recentEvents.data.forEach((e: any) => {
          activityItems.push({
            id: `event-${e.id}`,
            type: 'event',
            title: 'New Event Created',
            description: `Event "${e.name}" was scheduled`,
            timestamp: e.created_at,
          });
        });
      }
      if (recentFeedback.data) {
        recentFeedback.data.forEach((f: any) => {
          activityItems.push({
            id: `feedback-${f.id}`,
            type: 'feedback',
            title: 'Feedback Submitted',
            description: `"${f.title}" (${f.status})`,
            timestamp: f.created_at,
          });
        });
      }
      if (recentRoles.data) {
        recentRoles.data.forEach((r: any) => {
          activityItems.push({
            id: `role-${r.id}`,
            type: 'role_change',
            title: 'Privileged Role Change',
            description: `Role changed from ${r.old_role} to ${r.new_role}`,
            timestamp: r.created_at,
          });
        });
      }

      // Sort unified activities by timestamp desc and limit to 10
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const recentActivity = activityItems.slice(0, 10);

      // 4. Admin Audit Log (from role_changes)
      let auditLog: any[] = [];
      if (isSuperAdmin) {
        const { data: roleChanges } = await supabase.from('role_changes').select('*').order('created_at', { ascending: false }).limit(10);
        auditLog = roleChanges || [];
      }

      return Response.json({
        data: {
          kpis: {
            usersCount,
            clubsCount,
            matchesCount,
            openFeedbackCount,
          },
          needsAttention: {
            newFeedback: newFeedback.data || [],
            openSupport: openSupport.data || [],
          },
          recentActivity,
          auditLog,
        }
      }, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    const start = page * 50;
    const query = resource === 'users' ? supabase.from('profiles').select('id, first_name, last_name, display_name, email, phone, role', { count: 'exact' }).order('created_at', { ascending: false }).order('id')
      : resource === 'clubs' ? supabase.from('facilities').select('id, name, address, city, country, courts(id, facility_id, name, court_number, is_active)', { count: 'exact' }).order('name').order('id')
      : resource === 'feedback' ? supabase.from('feedback').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id')
      : resource === 'support' ? supabase.from('support_cases').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id')
      : supabase.from('role_changes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id');
    const { data, error, count } = await query.range(start, start + 49);
    if (error) throw error;
    return Response.json({ data, count }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    // Cookie-authenticated writes must originate from this application.
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new AdminError('Invalid request origin.', 403);
    const { supabase, user, profile } = await requireAdmin();
    const input = mutation.parse(await request.json());
    if (input.action === 'role.set') {
      if (profile.role !== 'super_admin') throw new AdminError('Only super admins can manage roles.', 403);
      const { error } = await supabase.rpc('set_user_role', { target_user_id: input.id, new_role: input.role });
      if (error) throw new AdminError(error.message, error.code === '42501' ? 403 : 400);
    } else {
      const operation = (() => {
        switch (input.action) {
          case 'profile.update': return supabase.from('profiles').update({ first_name: input.first_name, last_name: input.last_name, display_name: input.display_name, phone: input.phone || null }).eq('id', input.id).select('id').single();
          case 'feedback.status': return supabase.from('feedback').update({ status: input.status }).eq('id', input.id).select('id').single();
          case 'club.save': {
            const fields = { name: input.name, address: input.address, city: input.city, country: input.country };
            return input.id ? supabase.from('facilities').update(fields).eq('id', input.id).select('id').single()
              : supabase.from('facilities').insert({ ...fields, created_by: user.id }).select('id').single();
          }
          case 'club.delete': return supabase.from('facilities').delete().eq('id', input.id).select('id').single();
          case 'court.save': {
            const fields = { facility_id: input.facility_id, name: input.name, court_number: input.court_number, is_active: input.is_active };
            return input.id ? supabase.from('courts').update(fields).eq('id', input.id).select('id').single()
              : supabase.from('courts').insert(fields).select('id').single();
          }
          case 'court.delete': return supabase.from('courts').delete().eq('id', input.id).select('id').single();
          case 'support.create': return supabase.from('support_cases').insert({ user_id: input.user_id, subject: input.subject, notes: input.notes, created_by: user.id }).select('id').single();
          case 'support.update': return supabase.from('support_cases').update({ subject: input.subject, notes: input.notes, status: input.status }).eq('id', input.id).select('id').single();
        }
      })();
      const { error } = await operation;
      if (error) throw new AdminError(error.code === '23503' ? 'This item is still in use. Remove its references first.' : 'The record could not be changed. Refresh and check your permissions.', 400);
    }
    return Response.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
