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
  TrendingDown,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useStats, useAuditLog } from '../hooks/useAuthAdmin';

interface DashboardProps {
  onNavigate?: (path: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { Page, Card, Button, Badge, Spinner, EmptyState } = useUi();
  
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

  // Stats Card Component (inline for simplicity)
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    iconColor,
    subtitle,
    trend,
  }: {
    title: string;
    value: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    iconColor: string;
    subtitle?: string;
    trend?: { value: string; direction: 'up' | 'down' };
  }) => (
    <Card>
      <div className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span
                className={`text-sm ${
                  trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={iconColor}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  return (
    <Page
      title="Admin Dashboard"
      description="Overview of user activity and system status"
      actions={
        <Button variant="primary" onClick={() => navigate('/admin/users?action=create')}>
          <UserPlus size={16} className="mr-2" />
          Add User
        </Button>
      }
    >
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
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3 p-6">
          <Button variant="secondary" onClick={() => navigate('/admin/users')}>
            <Users size={16} className="mr-2" />
            View All Users
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/sessions')}>
            <Key size={16} className="mr-2" />
            Active Sessions
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/audit-log')}>
            <Activity size={16} className="mr-2" />
            Audit Log
          </Button>
          <Button variant="secondary" onClick={() => navigate('/admin/invites')}>
            <TrendingUp size={16} className="mr-2" />
            Invites
            {stats?.pending_invites ? (
              <Badge variant="info">{stats.pending_invites}</Badge>
            ) : null}
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        {auditLoading ? (
          <div className="flex justify-center py-12 p-6">
            <Spinner size="lg" />
          </div>
        ) : auditData?.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Clock size={48} />}
              title="No recent activity"
              description="Activity will appear here when users interact with the system"
            />
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {auditData?.items.map((entry, i) => (
              <div
                key={entry.id || i}
                className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getEventBadgeVariant(entry.event_type)}>
                      {entry.event_type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-sm text-gray-100 truncate">
                      {entry.user_email}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-400 flex items-center gap-2">
                    <span>{entry.ip_address}</span>
                    <span>•</span>
                    <span>{formatDate(entry.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/audit-log')}>
                View All Activity
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Page>
  );
}

export default Dashboard;
