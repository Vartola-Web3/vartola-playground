import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role;

  switch (role) {
    case 'ADMIN':
      redirect('/admin');
    case 'UNDERWRITER':
      redirect('/underwriter');
    case 'SME':
      redirect('/sme');
    case 'INVESTOR':
      redirect('/investor');
    default:
      redirect('/login');
  }
}
