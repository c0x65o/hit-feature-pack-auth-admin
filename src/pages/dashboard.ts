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

  // Stats Grid - simplified version
  if (opts.show_active_sessions_count) {
    children.push({
      type: 'Card',
      title: 'Active Sessions',
      className: 'mb-6',
      children: [
        {
          type: 'Async',
          endpoint: `${authUrl}/admin/sessions`,
          loading: {
            type: 'Text',
            content: 'Loading...',
            variant: 'muted',
          },
          error: {
            type: 'Text',
            content: 'Error loading sessions',
            variant: 'muted',
          },
        },
      ],
    });
  }

  // Quick Actions
  children.push({
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
  });

  // Recent Activity
  if (opts.show_recent_admin_actions) {
    children.push({
      type: 'Card',
      title: 'Recent Activity',
      className: 'mt-6',
      children: [
        {
          type: 'DataTable',
          endpoint: `${authUrl}/audit-log`,
          columns: [
            { key: 'user_email', label: 'User', type: 'text' },
            { key: 'event_type', label: 'Action', type: 'badge' },
            { key: 'ip_address', label: 'IP Address', type: 'text' },
            { key: 'created_at', label: 'Time', type: 'datetime' },
          ],
          pageSize: 10,
          emptyMessage: 'No recent activity',
        },
      ],
    });
  }

  return {
    type: 'Page',
    title: 'Admin Dashboard',
    description: 'Overview of user activity and system status',
    children,
  };
}
