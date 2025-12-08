/**
 * Admin Dashboard Page Generator
 */

import type { UISpec, RequestContext } from '@hit/feature-pack-types';

export async function dashboard(ctx: RequestContext): Promise<UISpec> {
  const { moduleUrls, userRoles } = ctx;

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

  return {
    type: 'Page',
    title: 'Admin Dashboard',
    description: 'Overview of user activity and system status',
    children: [
      // Stats Grid - loaded async from auth module
      {
        type: 'Async',
        endpoint: `${authUrl}/admin/stats`,
        loading: {
          type: 'Loading',
          variant: 'skeleton',
        },
        error: {
          type: 'Alert',
          variant: 'error',
          message: 'Failed to load dashboard stats',
        },
      },
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
            ],
          },
        ],
      },
      // Recent Activity
      {
        type: 'Card',
        title: 'Recent User Activity',
        className: 'mt-6',
        children: [
          {
            type: 'DataTable',
            endpoint: `${authUrl}/admin/recent-activity`,
            columns: [
              { key: 'user_email', label: 'User', type: 'text' },
              { key: 'action', label: 'Action', type: 'badge' },
              { key: 'ip_address', label: 'IP Address', type: 'text' },
              { key: 'created_at', label: 'Time', type: 'datetime' },
            ],
            pageSize: 10,
            pagination: false,
            emptyMessage: 'No recent activity',
          },
        ],
      },
    ],
  };
}
