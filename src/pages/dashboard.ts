/**
 * Admin Dashboard Page Generator
 */

import type { UISpec, RequestContext } from '@hit/feature-pack-types';

interface AuthAdminOptions {
  show_security_dashboard?: boolean;
  show_failed_login_chart?: boolean;
  show_active_sessions_count?: boolean;
  show_2fa_adoption_rate?: boolean;
  show_lockout_alerts?: boolean;
  show_recent_admin_actions?: boolean;
  show_pending_invites_count?: boolean;
  show_deactivated_users_count?: boolean;
}

export async function dashboard(ctx: RequestContext): Promise<UISpec> {
  const { moduleUrls, userRoles, options } = ctx;
  const opts = options as AuthAdminOptions;

  // Check admin permission
  if (!userRoles.includes('admin')) {
    return {
      type: 'Alert',
      variant: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to access the admin dashboard.',
    };
  }

  // moduleUrls.auth is a proxy path (e.g., '/api/proxy/auth')
  // The shell app proxies these requests to the internal auth module
  const authUrl = moduleUrls.auth;

  const children: UISpec[] = [];

  // Stats Grid
  children.push({
    type: 'Row',
    gap: 4,
    className: 'mb-6',
    children: [
      ...(opts.show_active_sessions_count
        ? [
            {
              type: 'Card',
              children: [
                {
                  type: 'Text',
                  content: 'Active Sessions',
                  variant: 'h3',
                },
                {
                  type: 'Async',
                  endpoint: `${authUrl}/sessions`,
                  transform: (data: any) => data?.sessions?.length || 0,
                  render: (count: number) => ({
                    type: 'Text',
                    content: String(count),
                    variant: 'h1',
                  }),
                },
              ],
            },
          ]
        : []),
      ...(opts.show_2fa_adoption_rate
        ? [
            {
              type: 'Card',
              children: [
                {
                  type: 'Text',
                  content: '2FA Adoption',
                  variant: 'h3',
                },
                {
                  type: 'Async',
                  endpoint: `${authUrl}/users`,
                  transform: (data: any) => {
                    const users = data?.users || [];
                    const with2FA = users.filter((u: any) => u.two_factor_enabled).length;
                    return users.length > 0 ? Math.round((with2FA / users.length) * 100) : 0;
                  },
                  render: (rate: number) => ({
                    type: 'Text',
                    content: `${rate}%`,
                    variant: 'h1',
                  }),
                },
              ],
            },
          ]
        : []),
      ...(opts.show_pending_invites_count
        ? [
            {
              type: 'Card',
              children: [
                {
                  type: 'Text',
                  content: 'Pending Invites',
                  variant: 'h3',
                },
                {
                  type: 'Async',
                  endpoint: `${authUrl}/invites?status=pending`,
                  transform: (data: any) => data?.invites?.length || 0,
                  render: (count: number) => ({
                    type: 'Text',
                    content: String(count),
                    variant: 'h1',
                  }),
                },
              ],
            },
          ]
        : []),
    ],
  });

  // Failed login chart
  if (opts.show_failed_login_chart) {
    children.push({
      type: 'Card',
      title: 'Failed Login Attempts',
      className: 'mb-6',
      children: [
        {
          type: 'Async',
          endpoint: `${authUrl}/audit-log?event_type=login_failure&limit=100`,
          transform: (data: any) => {
            // Group by date
            const events = data?.events || [];
            const byDate: Record<string, number> = {};
            events.forEach((e: any) => {
              const date = new Date(e.created_at).toLocaleDateString();
              byDate[date] = (byDate[date] || 0) + 1;
            });
            return Object.entries(byDate).map(([date, count]) => ({ date, count }));
          },
          render: (data: any[]) => ({
            type: 'Chart',
            chartType: 'line',
            data,
            xKey: 'date',
            yKey: 'count',
          }),
        },
      ],
    });
  }

  return {
    type: 'Page',
    title: 'Admin Dashboard',
    description: 'Overview of user activity and system status',
    children: [
      ...children,
      // Quick Actions
      {
        type: 'Card',
        title: 'Quick Actions',
        className: 'mt-6',
        children: [
          {
            type: 'Row',
            gap: 16,
            children: [
              {
                type: 'Button',
                label: 'Add User',
                variant: 'primary',
                icon: 'user-plus',
                onClick: {
                  type: 'navigate',
                  to: '/admin/users?action=create',
                },
              },
              {
                type: 'Button',
                label: 'View All Users',
                variant: 'outline',
                icon: 'users',
                onClick: {
                  type: 'navigate',
                  to: '/admin/users',
                },
              },
              {
                type: 'Button',
                label: 'Active Sessions',
                variant: 'outline',
                icon: 'key',
                onClick: {
                  type: 'navigate',
                  to: '/admin/sessions',
                },
              },
              {
                type: 'Button',
                label: 'Audit Log',
                variant: 'outline',
                icon: 'file-text',
                onClick: {
                  type: 'navigate',
                  to: '/admin/audit-log',
                },
              },
              {
                type: 'Button',
                label: 'Invites',
                variant: 'outline',
                icon: 'mail',
                onClick: {
                  type: 'navigate',
                  to: '/admin/invites',
                },
              },
            ],
          },
        ],
      },
      // Recent Activity
      ...(opts.show_recent_admin_actions
        ? [
            {
              type: 'Card',
              title: 'Recent Activity',
              className: 'mt-6',
              children: [
                {
                  type: 'DataTable',
                  dataSource: {
                    type: 'api',
                    method: 'GET',
                    url: `${authUrl}/audit-log`,
                    params: {
                      limit: 10,
                    },
                  },
                  columns: [
                    { key: 'user_email', label: 'User', type: 'text' },
                    { key: 'event_type', label: 'Action', type: 'badge' },
                    { key: 'ip_address', label: 'IP Address', type: 'text' },
                    { key: 'created_at', label: 'Time', type: 'datetime' },
                  ],
                  pagination: false,
                  emptyMessage: 'No recent activity',
                },
              ],
            },
          ]
        : []),
    ],
  };
}
