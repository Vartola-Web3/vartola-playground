'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadAuditLogs();
  }, [filter]);

  const loadAuditLogs = async () => {
    try {
      const url = filter === 'ALL' ? '/api/admin/audit' : `/api/admin/audit?action=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return <div>Access denied</div>;
  }

  const getActionColor = (action: string) => {
    if (action.includes('APPROVED') || action.includes('CREATED')) return 'text-green-600';
    if (action.includes('REJECTED') || action.includes('DELETED')) return 'text-red-600';
    if (action.includes('UPDATED')) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <DashboardLayout role={session.user.role}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">System Audit Log</h1>
          <select
            className="border border-gray-300 rounded-md px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="USER_REGISTERED">User Registration</option>
            <option value="APPLICATION_SUBMITTED">Application Submitted</option>
            <option value="APPLICATION_APPROVED">Application Approved</option>
            <option value="APPLICATION_REJECTED">Application Rejected</option>
            <option value="POOL_CREATED">Pool Created</option>
            <option value="INVESTMENT_SUBSCRIBED">Investment Subscribed</option>
            <option value="USER_CREATED">User Created</option>
          </select>
        </div>

        {loading ? (
          <div>Loading audit logs...</div>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No audit logs found</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`font-semibold ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {log.entityType} • ID: {log.entityId.substring(0, 8)}...
                        </p>
                        {log.changes && (
                          <details className="mt-2">
                            <summary className="text-sm text-blue-600 cursor-pointer">
                              View changes
                            </summary>
                            <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                              {JSON.stringify(JSON.parse(log.changes), null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">{log.user.name}</p>
                        <p className="text-xs text-gray-500">{log.user.role}</p>
                        <p className="text-xs text-gray-500">{log.user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
