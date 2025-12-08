/**
 * User Detail Page Generator
 */

import type { UISpec, RequestContext } from '@hit/feature-pack-types';

interface AuthAdminOptions {
  allow_password_reset?: boolean;
  allow_user_deletion?: boolean;
  allow_session_revoke?: boolean;
  show_impersonate_button?: boolean;
  impersonate_warning_text?: string;
  impersonate_banner_color?: string;
  impersonate_end_button?: boolean;
}

export async function userDetail(ctx: RequestContext): Promise<UISpec> {
  const { moduleUrls, options, userRoles } = ctx;
  const opts = options as AuthAdminOptions;

  // Check admin permission
  if (!userRoles.includes('admin')) {
    return {
      type: 'Alert',
      variant: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to view user details.',
    };
  }

  // moduleUrls.auth is a proxy path (e.g., '/api/proxy/auth')
  // The shell app proxies these requests to the internal auth module
  const authUrl = moduleUrls.auth;

  return {
    type: 'Page',
    title: 'User Details',
    description: 'View and manage user account',
    actions: [
      {
        type: 'Button',
        label: 'Back to Users',
        variant: 'outline',
        icon: 'arrow-left',
        onClick: {
          type: 'navigate',
          to: '/admin/users',
        },
      },
    ],
    children: [
      // User info loaded async
      {
        type: 'Async',
        endpoint: `${authUrl}/admin/users/{email}`,
        loading: {
          type: 'Loading',
          variant: 'skeleton',
        },
        error: {
          type: 'Alert',
          variant: 'error',
          message: 'Failed to load user details',
        },
      },
      // Actions Card
      {
        type: 'Card',
        title: 'Actions',
        className: 'mt-6',
        children: [
          {
            type: 'Row',
            gap: 12,
            children: [
              ...(opts.allow_password_reset
                ? [
                    {
                      type: 'Button' as const,
                      label: 'Send Password Reset',
                      variant: 'outline' as const,
                      icon: 'mail',
                      onClick: {
                        type: 'api' as const,
                        method: 'POST' as const,
                        endpoint: `${authUrl}/admin/users/{email}/reset-password`,
                        onSuccess: {
                          type: 'openModal' as const,
                          modal: {
                            type: 'Modal' as const,
                            title: 'Email Sent',
                            size: 'sm' as const,
                            children: [
                              {
                                type: 'Text' as const,
                                content: 'Password reset email has been sent.',
                              },
                            ],
                            footer: [
                              {
                                type: 'Button' as const,
                                label: 'OK',
                                variant: 'primary' as const,
                                onClick: { type: 'closeModal' as const },
                              },
                            ],
                          },
                        },
                      },
                    },
                  ]
                : []),
              ...(opts.allow_session_revoke
                ? [
                    {
                      type: 'Button' as const,
                      label: 'Revoke All Sessions',
                      variant: 'outline' as const,
                      icon: 'log-out',
                      onClick: {
                        type: 'api' as const,
                        method: 'DELETE' as const,
                        endpoint: `${authUrl}/admin/users/{email}/sessions`,
                        confirm: 'This will log the user out of all devices. Continue?',
                        onSuccess: {
                          type: 'refresh' as const,
                        },
                      },
                    },
                  ]
                : []),
              ...(opts.show_impersonate_button
                ? [
                    {
                      type: 'Button' as const,
                      label: 'Impersonate User',
                      variant: 'outline' as const,
                      icon: 'user-cog',
                      onClick: {
                        type: 'api' as const,
                        method: 'POST' as const,
                        endpoint: `${authUrl}/impersonate/start`,
                        body: {
                          user_email: '{email}',
                        },
                        onSuccess: {
                          type: 'updateAuth',
                          redirect: '/',
                        },
                      },
                    },
                  ]
                : []),
              ...(opts.allow_user_deletion
                ? [
                    {
                      type: 'Button' as const,
                      label: 'Delete User',
                      variant: 'danger' as const,
                      icon: 'trash',
                      onClick: {
                        type: 'api' as const,
                        method: 'DELETE' as const,
                        endpoint: `${authUrl}/admin/users/{email}`,
                        confirm:
                          'Are you sure you want to delete this user? This action cannot be undone.',
                        onSuccess: {
                          type: 'navigate' as const,
                          to: '/admin/users',
                        },
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
      },
      // User Sessions
      {
        type: 'Card',
        title: 'Active Sessions',
        className: 'mt-6',
        children: [
          {
            type: 'DataTable',
            endpoint: `${authUrl}/admin/users/{email}/sessions`,
            columns: [
              { key: 'device', label: 'Device', type: 'text' },
              { key: 'ip_address', label: 'IP Address', type: 'text' },
              { key: 'location', label: 'Location', type: 'text' },
              { key: 'last_active', label: 'Last Active', type: 'datetime' },
              { key: 'created_at', label: 'Started', type: 'datetime' },
            ],
            pageSize: 10,
            emptyMessage: 'No active sessions',
            rowActions: opts.allow_session_revoke
              ? [
                  {
                    type: 'Button',
                    label: 'Revoke',
                    variant: 'danger',
                    size: 'sm',
                    onClick: {
                      type: 'api',
                      method: 'DELETE',
                      endpoint: `${authUrl}/admin/sessions/{id}`,
                      onSuccess: {
                        type: 'refresh',
                      },
                    },
                  },
                ]
              : [],
          },
        ],
      },
      // Activity Log
      {
        type: 'Card',
        title: 'Recent Activity',
        className: 'mt-6',
        children: [
          {
            type: 'DataTable',
            endpoint: `${authUrl}/admin/users/{email}/activity`,
            columns: [
              { key: 'action', label: 'Action', type: 'badge' },
              { key: 'ip_address', label: 'IP Address', type: 'text' },
              { key: 'user_agent', label: 'Device', type: 'text' },
              { key: 'created_at', label: 'Time', type: 'datetime' },
            ],
            pageSize: 20,
            emptyMessage: 'No activity recorded',
          },
        ],
      },
    ],
  };
}
