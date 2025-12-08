'use client';

import React, { useState } from 'react';
import { Trash2, RefreshCw, Monitor, Smartphone, Globe } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useSessions, useSessionMutations, type Session } from '../hooks/useAuthAdmin';

interface SessionsProps {
  onNavigate?: (path: string) => void;
}

export function Sessions({ onNavigate }: SessionsProps) {
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
      return <Smartphone className="w-4 h-4 text-gray-400" />;
    }
    return <Monitor className="w-4 h-4 text-gray-400" />;
  };

  const getDeviceName = (userAgent: string) => {
    if (!userAgent) return 'Unknown Device';
    
    // Simple parsing - could be enhanced with a proper UA parser
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return userAgent.split(' ')[0] || 'Unknown';
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const columns = [
    {
      key: 'user_email',
      label: 'User',
      render: (session: Session) => (
        <button
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/users/${encodeURIComponent(session.user_email)}`);
          }}
        >
          {session.user_email}
        </button>
      ),
    },
    {
      key: 'device',
      label: 'Device',
      render: (session: Session) => (
        <div className="flex items-center gap-2">
          {getDeviceIcon(session.user_agent)}
          <span>{getDeviceName(session.user_agent)}</span>
        </div>
      ),
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      render: (session: Session) => (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm">{session.ip_address}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Started',
      render: (session: Session) => formatDate(session.created_at),
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (session: Session) => (
        <div className="flex items-center gap-2">
          <span>{formatDate(session.expires_at)}</span>
          {isExpired(session.expires_at) && (
            <Badge variant="error" size="sm">Expired</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (session: Session) => (
        <Badge variant={session.current ? 'success' : isExpired(session.expires_at) ? 'error' : 'default'}>
          {session.current ? 'Current' : isExpired(session.expires_at) ? 'Expired' : 'Active'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Sessions"
        description="Monitor and manage user sessions"
        actions={
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => refresh()}
          >
            Refresh
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={loading}
        error={error}
        searchable
        searchPlaceholder="Search by email or IP..."
        searchValue={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        rowActions={(session) =>
          !session.current && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-red-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleRevokeSession(session.id);
              }}
              loading={mutating}
            >
              Revoke
            </Button>
          )
        }
        emptyMessage="No active sessions"
      />
    </div>
  );
}

export default Sessions;
