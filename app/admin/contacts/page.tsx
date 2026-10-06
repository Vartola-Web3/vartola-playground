import { AdminPage } from '@/components/ops/ui';
import { ContactManager } from '@/components/ops/contact-manager';

export const dynamic = 'force-dynamic';

export default function ContactsPage() {
  return (
    <AdminPage title="Contact enquiries" intro="Enquiries from the public contact form. Statuses: New, Contacted, Qualified, Partner discussion, Pilot, Closed, Spam. Internal notes and status changes are audit-logged. Submitter IPs are stored only as a salted hash.">
      <ContactManager />
    </AdminPage>
  );
}
