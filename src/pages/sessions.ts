/**
 * Sessions Management Page Generator
 */

import type { UISpec, RequestContext, ButtonSpec } from '@hit/feature-pack-types';

interface AuthAdminOptions {
  sessions_per_page?: number;
  allow_session_revoke?: boolean;
}

export async function sessions(ctx: RequestContext): Promise<UISpec> {
  const { moduleUrls, options, userRoles } = ctx;
  const opts = options as AuthAdminOptions;

  // Check admin permission
  if (!userRoles.includes('admin')) {
    return {
      type: 'Alert',
      variant: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to manage sessions.',
    };
  }

  // moduleUrls.auth is a proxy path (e.g., '/api/proxy/auth')
  // The shell app proxies these requests to the internal auth module
  const authUrl = moduleUrls.auth;

  // Build row actions
  const rowActions: ButtonSpec[] = [
    {
      type: 'Button',
      label: 'View User',
      variant: 'ghost',
      icon: 'user',
      onClick: {
        type: 'navigate',
        to: '/admin/users/{user_email}',
      },
    },
  ];

  if (opts.allow_session_revoke) {
    rowActions.push({
      type: 'Button',
      label: 'Revoke',
      variant: 'danger',
      icon: 'x',
      onClick: {
        type: 'api',
        method: 'DELETE',
        endpoint: `${authUrl}/admin/sessions/{id}`,
        confirm: 'Revoke this session? The user will be logged out.',
        onSuccess: {
          type: 'refresh',
        },
      },
    });
  }

  // Build page actions
  const pageActions: ButtonSpec[] = [];

  if (opts.allow_session_revoke) {
    pageActions.push({
      type: 'Button',
      label: 'Revoke All Sessions',
      variant: 'danger',
      icon: 'log-out',
      onClick: {
        type: 'api',
        method: 'DELETE',
        endpoint: `${authUrl}/admin/sessions`,
        confirm: 'This will log out ALL users. Are you sure?',
        onSuccess: {
          type: 'refresh',
        },
      },
    });
  }

  return {
    type: 'Page',
    title: 'Sessions',
    description: 'Manage active user sessions',
    actions: pageActions,
    children: [
      // Stats row
      {
        type: 'StatsGrid',
        columns: 4,
        items: [
          {
            label: 'Active Sessions',
            value: '—',
            icon: 'activity',
          },
          {
            label: 'Unique Users',
            value: '—',
            icon: 'users',
          },
          {
            label: 'Sessions Today',
            value: '—',
            icon: 'calendar',
          },
          {
            label: 'Avg Duration',
            value: '—',
            icon: 'clock',
          },
        ],
      },
      // Sessions Table
      {
        type: 'Card',
        className: 'mt-6',
        children: [
          {
            type: 'DataTable',
            endpoint: `${authUrl}/admin/sessions`,
            columns: [
              { key: 'user_email', label: 'User', type: 'link', sortable: true },
              { key: 'device', label: 'Device', type: 'text' },
              { key: 'ip_address', label: 'IP Address', type: 'text' },
              { key: 'location', label: 'Location', type: 'text' },
              { key: 'last_active', label: 'Last Active', type: 'datetime', sortable: true },
              { key: 'created_at', label: 'Started', type: 'datetime', sortable: true },
            ],
            pageSize: opts.sessions_per_page || 50,
            pagination: true,
            searchable: true,
            sortable: true,
            rowActions,
            emptyMessage: 'No active sessions',
          },
        ],
      },
    ],
  };
}
