import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import VerificationClient from '@/components/compliance/verification-client';

export const dynamic = 'force-dynamic';

export default async function VerifyIdentityPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'SME' && session.user.role !== 'INVESTOR')) redirect('/login');

  return (
    <DashboardLayout role={session.user.role}>
      <VerificationClient />
    </DashboardLayout>
  );
}
