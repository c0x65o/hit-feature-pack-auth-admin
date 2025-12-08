'use client';

import React, { useState } from 'react';
import { RefreshCw, Download, Eye } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useAuditLog, type AuditLogEntry } from '../hooks/useAuthAdmin';

interface AuditLogProps {
  onNavigate?: (path: string) => void;
}

export function AuditLog({ onNavigate }: AuditLogProps) {
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
    // Simple CSV export
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

  const columns = [
    {
      key: 'created_at',
      label: 'Time',
      render: (entry: AuditLogEntry) => (
        <span className="text-sm">{formatDate(entry.created_at)}</span>
      ),
    },
    {
      key: 'user_email',
      label: 'User',
      render: (entry: AuditLogEntry) => (
        <button
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/users/${encodeURIComponent(entry.user_email)}`);
          }}
        >
          {entry.user_email}
        </button>
      ),
    },
    {
      key: 'event_type',
      label: 'Event',
      render: (entry: AuditLogEntry) => (
        <Badge variant={getEventBadgeVariant(entry.event_type)}>
          {formatEventType(entry.event_type)}
        </Badge>
      ),
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (entry: AuditLogEntry) => (
        <span className="font-mono text-sm">{entry.ip_address}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Security events and user activity"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={Download}
              onClick={handleExport}
              disabled={!data?.items?.length}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={() => refresh()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={loading}
        error={error}
        searchable
        searchPlaceholder="Search by email, event, or IP..."
        searchValue={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        rowActions={(entry) => (
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEntry(entry);
            }}
          >
            Details
          </Button>
        )}
        emptyMessage="No audit log entries found"
      />

      {/* Entry Details Modal */}
      <Modal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="Audit Log Entry"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
            Close
          </Button>
        }
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Time</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {formatDate(selectedEntry.created_at)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">User</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedEntry.user_email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Event</label>
                <Badge variant={getEventBadgeVariant(selectedEntry.event_type)}>
                  {formatEventType(selectedEntry.event_type)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">IP Address</label>
                <p className="font-mono text-gray-900 dark:text-gray-100">
                  {selectedEntry.ip_address}
                </p>
              </div>
            </div>

            {selectedEntry.user_agent && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User Agent</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {selectedEntry.user_agent}
                </p>
              </div>
            )}

            {selectedEntry.details && Object.keys(selectedEntry.details).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Additional Details</label>
                <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-sm overflow-auto">
                  {JSON.stringify(selectedEntry.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AuditLog;
