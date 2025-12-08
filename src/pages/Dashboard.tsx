'use client';

import React from 'react';
import {
  Users,
  Key,
  Shield,
  AlertTriangle,
  UserPlus,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useStats, useAuditLog } from '../hooks/useAuthAdmin';

interface DashboardProps {
  onNavigate?: (path: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { stats, loading: statsLoading } = useStats();
  const { data: auditData, loading: auditLoading } = useAuditLog({ pageSize: 5 });

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getEventBadgeVariant = (eventType: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    if (eventType.includes('login_success')) return 'success';
    if (eventType.includes('login_failed')) return 'error';
    if (eventType.includes('password')) return 'warning';
    if (eventType.includes('created') || eventType.includes('registered')) return 'info';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of user activity and system status"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => navigate('/admin/users?action=create')}
            >
              Add User
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={statsLoading ? '...' : (stats?.total_users ?? 0)}
          icon={Users}
          iconColor="text-blue-500"
          trend={
            stats?.new_users_7d
              ? { value: `${stats.new_users_7d} new this week`, direction: 'up' }
              : undefined
          }
        />
        <StatsCard
          title="Active Sessions"
          value={statsLoading ? '...' : (stats?.active_sessions ?? 0)}
          icon={Key}
          iconColor="text-green-500"
          subtitle="Currently logged in"
        />
        <StatsCard
          title="2FA Adoption"
          value={statsLoading ? '...' : `${stats?.two_factor_adoption ?? 0}%`}
          icon={Shield}
          iconColor="text-purple-500"
          trend={
            stats?.two_factor_adoption && stats.two_factor_adoption > 50
              ? { value: 'Above target', direction: 'up' }
              : { value: 'Below target', direction: 'down' }
          }
        />
        <StatsCard
          title="Failed Logins (24h)"
          value={statsLoading ? '...' : (stats?.failed_logins_24h ?? 0)}
          icon={AlertTriangle}
          iconColor={
            (stats?.failed_logins_24h ?? 0) > 10 ? 'text-red-500' : 'text-yellow-500'
          }
          subtitle="Potential security concern"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            icon={Users}
            onClick={() => navigate('/admin/users')}
          >
            View All Users
          </Button>
          <Button
            variant="outline"
            icon={Key}
            onClick={() => navigate('/admin/sessions')}
          >
            Active Sessions
          </Button>
          <Button
            variant="outline"
            icon={Activity}
            onClick={() => navigate('/admin/audit-log')}
          >
            Audit Log
          </Button>
          <Button
            variant="outline"
            icon={TrendingUp}
            onClick={() => navigate('/admin/invites')}
          >
            Invites
            {stats?.pending_invites ? (
              <Badge variant="info" className="ml-2">
                {stats.pending_invites}
              </Badge>
            ) : null}
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/audit-log')}
          >
            View All
          </Button>
        </div>
        
        {auditLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : auditData?.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditData?.items.map((entry, i) => (
              <div
                key={entry.id || i}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getEventBadgeVariant(entry.event_type)}>
                      {entry.event_type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {entry.user_email}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span>{entry.ip_address}</span>
                    <span>•</span>
                    <span>{formatDate(entry.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
