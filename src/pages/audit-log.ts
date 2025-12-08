/**
 * Audit Log Page Generator
 */

import type { UISpec, RequestContext } from '@hit/feature-pack-types';

interface AuthAdminOptions {
  show_audit_log?: boolean;
  audit_log_per_page?: number;
  audit_log_filters?: string[];
  audit_show_user_events?: boolean;
  audit_show_admin_events?: boolean;
  audit_show_invite_events?: boolean;
  audit_show_impersonation_events?: boolean;
  audit_log_export?: boolean;
  audit_export_formats?: string[];
}

export async function auditLog(ctx: RequestContext): Promise<UISpec> {
  const options = ctx.options as AuthAdminOptions;
  const authUrl = ctx.moduleUrls.auth;

  if (!options.show_audit_log) {
    return {
      type: 'Container',
      children: [
        {
          type: 'Text',
          content: 'Audit log is not available',
          variant: 'h2',
        },
      ],
    };
  }

  const children: UISpec[] = [];

  // Title
  children.push({
    type: 'Text',
    content: 'Audit Log',
    variant: 'h2',
    className: 'mb-6',
  });

  // Filters
  if (options.audit_log_filters && options.audit_log_filters.length > 0) {
    children.push({
      type: 'Form',
      method: 'GET',
      children: [
        {
          type: 'Row',
          gap: 4,
          children: [
            ...(options.audit_log_filters.includes('event_type')
              ? [
                  {
                    type: 'FormField',
                    name: 'event_type',
                    label: 'Event Type',
                    inputType: 'select',
                    options: [
                      { value: '', label: 'All Events' },
                      { value: 'login_success', label: 'Login Success' },
                      { value: 'login_failure', label: 'Login Failure' },
                      { value: 'logout', label: 'Logout' },
                      { value: 'user_created', label: 'User Created' },
                      { value: 'user_deleted', label: 'User Deleted' },
                      { value: 'invite_sent', label: 'Invite Sent' },
                      { value: 'impersonation_started', label: 'Impersonation Started' },
                    ],
                  },
                ]
              : []),
            ...(options.audit_log_filters.includes('user')
              ? [
                  {
                    type: 'FormField',
                    name: 'user_email',
                    label: 'User Email',
                    inputType: 'text',
                    placeholder: 'user@example.com',
                  },
                ]
              : []),
            ...(options.audit_log_filters.includes('admin')
              ? [
                  {
                    type: 'FormField',
                    name: 'actor_email',
                    label: 'Actor Email',
                    inputType: 'text',
                    placeholder: 'admin@example.com',
                  },
                ]
              : []),
            {
              type: 'Button',
              label: 'Filter',
              variant: 'primary',
              type: 'submit',
            },
          ],
        },
      ],
    });
  }

  // Export button
  if (options.audit_log_export) {
    children.push({
      type: 'Row',
      justify: 'end',
      className: 'mb-4',
      children: [
        ...(options.audit_export_formats?.includes('csv')
          ? [
              {
                type: 'Button',
                label: 'Export CSV',
                variant: 'outline',
                onClick: {
                  type: 'api',
                  method: 'GET',
                  url: `${authUrl}/audit-log`,
                  params: {
                    format: 'csv',
                  },
                  onSuccess: {
                    type: 'download',
                    filename: 'audit-log.csv',
                  },
                },
              },
            ]
          : []),
        ...(options.audit_export_formats?.includes('json')
          ? [
              {
                type: 'Button',
                label: 'Export JSON',
                variant: 'outline',
                onClick: {
                  type: 'api',
                  method: 'GET',
                  url: `${authUrl}/audit-log`,
                  params: {
                    format: 'json',
                  },
                  onSuccess: {
                    type: 'download',
                    filename: 'audit-log.json',
                  },
                },
              },
            ]
          : []),
      ],
    });
  }

  // Audit log table
  children.push({
    type: 'DataTable',
    dataSource: {
      type: 'api',
      method: 'GET',
      url: `${authUrl}/audit-log`,
      params: {
        limit: options.audit_log_per_page || 50,
      },
    },
    columns: [
      {
        key: 'created_at',
        label: 'Time',
        render: (event: any) => {
          if (!event.created_at) return '-';
          return new Date(event.created_at).toLocaleString();
        },
      },
      {
        key: 'event_type',
        label: 'Event',
        render: (event: any) => {
          const type = event.event_type || '';
          return type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        },
      },
      {
        key: 'user_email',
        label: 'User',
      },
      {
        key: 'actor_email',
        label: 'Actor',
      },
      {
        key: 'ip_address',
        label: 'IP Address',
      },
      {
        key: 'metadata',
        label: 'Details',
        render: (event: any) => {
          const metadata = event.metadata || {};
          return Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '-';
        },
      },
    ],
    pagination: {
      pageSize: options.audit_log_per_page || 50,
    },
  });

  return {
    type: 'Container',
    maxWidth: 'full',
    className: 'p-6',
    children,
  };
}
