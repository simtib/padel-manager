import { redirect } from 'next/navigation';
import { AdminError, requireAdmin } from '../../lib/admin';
import AdminSidebar from './AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAdmin().catch((error: unknown) => {
    if (error instanceof AdminError) redirect(error.status === 401 ? '/login' : '/dashboard');
    throw error;
  });
  return <div className="min-h-screen lg:flex">
    <AdminSidebar role={access.profile.role} />
    <main aria-label="Admin area" className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:ml-64"><div className="mx-auto max-w-7xl">{children}</div></main>
  </div>;
}
