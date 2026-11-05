import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { user, profile } = await getCurrentSession();

  if (!user || !profile) {
    redirect('/login');
  }

  switch (profile.role) {
    case 'admin':
      redirect('/admin/guidelines');
    case 'manager':
      redirect('/audit');
    case 'reviewer':
      redirect('/rules');
    case 'creator':
    default:
      redirect('/rules');
  }
}
