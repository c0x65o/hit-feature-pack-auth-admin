'use client';

import React, { useState } from 'react';
import { Trash2, RefreshCw, Monitor, Smartphone, Globe } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useSessions, useSessionMutations, type Session } from '../hooks/useAuthAdmin';

interface SessionsProps {
  onNavigate?: (path: string) => void;
}

export function Sessions({ onNavigate }: SessionsProps) {
  const { Page, Card, Button, Badge, Table, Input, Alert, Spinner } = useUi();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, loading, error, refresh } = useSessions({
    page,
    pageSize: 50,
    search,
  });

  const { revokeSession, loading: mutating } = useSessionMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      try {
        await revokeSession(sessionId);
        refresh();
      } catch {
        // Error handled by hook
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent?.toLowerCase() || '';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone size={16} className="text-gray-400" />;
    }
    return <Monitor size={16} className="text-gray-400" />;
  };

  const getDeviceName = (userAgent: string) => {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return userAgent.split(' ')[0] || 'Unknown';
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <Page
      title="Active Sessions"
      description="Monitor and manage user sessions"
      actions={
        <Button variant="secondary" onClick={() => refresh()}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      }
    >
      {/* Search */}
      <Card>
        <div className="max-w-md">
          <Input
            label="Search Sessions"
            value={search}
            onChange={setSearch}
            placeholder="Search by email or IP..."
          />
        </div>
      </Card>

      {error && (
        <Alert variant="error" title="Error loading sessions">
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
                  key: 'device',
                  label: 'Device',
                  render: (_, row) => (
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(row.user_agent as string)}
                      <span>{getDeviceName(row.user_agent as string)}</span>
                    </div>
                  ),
                },
                {
                  key: 'ip_address',
                  label: 'IP Address',
                  render: (value) => (
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400" />
                      <span className="font-mono text-sm">{value as string}</span>
                    </div>
                  ),
                },
                {
                  key: 'created_at',
                  label: 'Started',
                  render: (value) => formatDate(value as string),
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (_, row) => {
                    const current = row.current as boolean;
                    const expired = isExpired(row.expires_at as string);
                    return (
                      <Badge variant={current ? 'success' : expired ? 'error' : 'default'}>
                        {current ? 'Current' : expired ? 'Expired' : 'Active'}
                      </Badge>
                    );
                  },
                },
                {
                  key: 'actions',
                  label: '',
                  align: 'right' as const,
                  render: (_, row) => {
                    if (row.current) return null;
                    return (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(row.id as string)}
                        disabled={mutating}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    );
                  },
                },
              ]}
              data={(data?.items || []).map((session) => ({
                id: session.id,
                user_email: session.user_email,
                user_agent: session.user_agent,
                ip_address: session.ip_address,
                created_at: session.created_at,
                expires_at: session.expires_at,
                current: session.current,
              }))}
              emptyMessage="No active sessions"
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
    </Page>
  );
}

export default Sessions;
