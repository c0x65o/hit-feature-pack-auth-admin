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
  const { userRoles } = ctx;

  // Check admin permission
  if (!userRoles.includes('admin')) {
    return {
      type: 'Alert',
      variant: 'error',
      title: 'Access Denied',
      message: 'You do not have permission to view the audit log.',
    };
  }

  if (!options.show_audit_log) {
    return {
      type: 'Page',
      children: [
        {
          type: 'Alert',
          variant: 'error',
          title: 'Audit log is not available',
          message: 'Audit log is not enabled',
        },
      ],
    };
  }

  return {
    type: 'Page',
    title: 'Audit Log',
    description: 'Security events and user activity',
    children: [
      {
        type: 'Card',
        className: 'mb-6',
        children: [
          {
            type: 'DataTable',
            endpoint: `${authUrl}/audit-log`,
            columns: [
              { key: 'created_at', label: 'Time', type: 'datetime' },
              { key: 'event_type', label: 'Event', type: 'text' },
              { key: 'user_email', label: 'User', type: 'text' },
              { key: 'actor_email', label: 'Actor', type: 'text' },
              { key: 'ip_address', label: 'IP Address', type: 'text' },
            ],
            pageSize: options.audit_log_per_page || 50,
            emptyMessage: 'No audit events found',
          },
        ],
      },
    ],
  };
}
