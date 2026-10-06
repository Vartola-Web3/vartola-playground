import { prisma } from '../../lib/db';
import { reconcile } from '../../lib/alpha/reconcile';

reconcile()
  .then((report) => {
    console.log(JSON.stringify(report, null, 2));
    process.exit(report.status === 'FAILED' ? 2 : 0);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
