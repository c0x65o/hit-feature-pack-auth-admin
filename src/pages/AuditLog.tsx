'use client';

import React, { useState } from 'react';
import { RefreshCw, Download, Eye } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useAuditLog, type AuditLogEntry } from '../hooks/useAuthAdmin';

interface AuditLogProps {
  onNavigate?: (path: string) => void;
}

export function AuditLog({ onNavigate }: AuditLogProps) {
  const { Page, Card, Button, Badge, Table, Modal, Input, Alert, Spinner } = useUi();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const { data, loading, error, refresh } = useAuditLog({
    page,
    pageSize: 50,
    search,
  });

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getEventBadgeVariant = (eventType: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    const type = eventType.toLowerCase();
    if (type.includes('success') || type.includes('created') || type.includes('enabled')) return 'success';
    if (type.includes('failed') || type.includes('error') || type.includes('deleted')) return 'error';
    if (type.includes('attempt') || type.includes('reset') || type.includes('disabled')) return 'warning';
    if (type.includes('updated') || type.includes('changed')) return 'info';
    return 'default';
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleExport = () => {
    if (!data?.items) return;
    
    const headers = ['Time', 'User', 'Event', 'IP Address', 'User Agent'];
    const rows = data.items.map((entry) => [
      entry.created_at,
      entry.user_email,
      entry.event_type,
      entry.ip_address,
      entry.user_agent || '',
    ]);
    
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Page
      title="Audit Log"
      description="Security events and user activity"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleExport} disabled={!data?.items?.length}>
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => refresh()}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Search */}
      <Card>
        <div className="max-w-md">
          <Input
            label="Search Audit Log"
            value={search}
            onChange={setSearch}
            placeholder="Search by email, event, or IP..."
          />
        </div>
      </Card>

      {error && (
        <Alert variant="error" title="Error loading audit log">
          {error.message}
        </Alert>
      )}

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <Table
              columns={[
                {
                  key: 'created_at',
                  label: 'Time',
                  render: (value) => <span className="text-sm">{formatDate(value as string)}</span>,
                },
                {
                  key: 'user_email',
                  label: 'User',
                  render: (value) => (
                    <button
                      className="text-blue-500 hover:text-blue-400"
                      onClick={() => navigate(`/admin/users/${encodeURIComponent(value as string)}`)}
                    >
                      {value as string}
                    </button>
                  ),
                },
                {
                  key: 'event_type',
                  label: 'Event',
                  render: (value) => (
                    <Badge variant={getEventBadgeVariant(value as string)}>
                      {formatEventType(value as string)}
                    </Badge>
                  ),
                },
                {
                  key: 'ip_address',
                  label: 'IP Address',
                  render: (value) => <span className="font-mono text-sm">{value as string}</span>,
                },
                {
                  key: 'actions',
                  label: '',
                  align: 'right' as const,
                  render: (_, row) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEntry(row as unknown as AuditLogEntry)}
                    >
                      <Eye size={16} className="mr-1" />
                      Details
                    </Button>
                  ),
                },
              ]}
              data={(data?.items || []).map((entry) => ({
                id: entry.id,
                created_at: entry.created_at,
                user_email: entry.user_email,
                event_type: entry.event_type,
                ip_address: entry.ip_address,
                user_agent: entry.user_agent,
                details: entry.details,
              }))}
              emptyMessage="No audit log entries found"
            />

            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Page {data.page} of {data.total_pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= data.total_pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Entry Details Modal */}
      <Modal
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="Audit Log Entry"
        size="lg"
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Time</label>
                <p className="text-gray-100">{formatDate(selectedEntry.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">User</label>
                <p className="text-gray-100">{selectedEntry.user_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Event</label>
                <Badge variant={getEventBadgeVariant(selectedEntry.event_type)}>
                  {formatEventType(selectedEntry.event_type)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">IP Address</label>
                <p className="font-mono text-gray-100">{selectedEntry.ip_address}</p>
              </div>
            </div>

            {selectedEntry.user_agent && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User Agent</label>
                <p className="text-sm text-gray-400 break-all">{selectedEntry.user_agent}</p>
              </div>
            )}

            {selectedEntry.details && Object.keys(selectedEntry.details).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Additional Details</label>
                <pre className="bg-gray-800 rounded-lg p-3 text-sm overflow-auto">
                  {JSON.stringify(selectedEntry.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
}

export default AuditLog;
