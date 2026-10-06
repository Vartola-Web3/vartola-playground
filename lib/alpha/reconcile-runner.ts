import { prisma } from '@/lib/db';
import { reconcile } from '@/lib/alpha/reconcile';
import { reconciliationCode, setLastReconciliation, type ReconciliationRecord } from '@/lib/alpha/ops-state';
import { rememberOperation } from '@/lib/firebase/operations';
import { sendNotification } from '@/lib/notifications/providers';

// Runs a reconciliation, stores the outcome, and alerts operations when it is not clean.
// Alerts never block the run: the audit log and the Firebase journal are always written, and email is attempted
// only when ALERT_EMAIL is set.
export async function runReconciliation(trigger: ReconciliationRecord['trigger'], actorId?: string) {
  const report = await reconcile();
  const record: ReconciliationRecord = {
    code: reconciliationCode(report.status),
    status: report.status,
    checkedAt: report.checkedAt,
    facilities: report.facilities,
    findings: report.findings.length,
    trigger,
  };
  await setLastReconciliation(record);
  if (report.status !== 'HEALTHY') {
    const summary = report.findings.slice(0, 5).map((row) => `${row.code}: ${row.message}`).join(' | ');
    await prisma.auditLog.create({
      data: {
        userId: actorId || (await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } }))?.id || 'system',
        action: record.code,
        entityType: 'Reconciliation',
        entityId: record.checkedAt,
        changes: JSON.stringify({ trigger, findings: report.findings.length, summary }),
      },
    }).catch((error) => console.error('Could not write the reconciliation alert to the audit log:', error));
    await rememberOperation({ id: `Reconciliation_${record.checkedAt}`, title: `${record.code.replaceAll('_', ' ')}`, kind: record.code, status: report.status, entityType: 'Reconciliation', entityId: record.checkedAt });
    if (process.env.ALERT_EMAIL) {
      await sendNotification('email', process.env.ALERT_EMAIL, 'OPERATIONS_ALERT', `${record.code}: ${report.findings.length} finding(s). ${summary}`).catch((error) => console.error('Alert email failed:', error instanceof Error ? error.message : error));
    }
  }
  return { ...report, record };
}
