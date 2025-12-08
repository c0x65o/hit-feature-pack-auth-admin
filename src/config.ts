/**
 * Configuration schema and defaults for auth-admin feature pack
 */

import type { ConfigSchema, ConfigDefaults } from '@hit/feature-pack-types';

export const configDefaults: ConfigDefaults = {
  // ─────────────────────────────────────────────────────────────
  // USERS TABLE
  // ─────────────────────────────────────────────────────────────
  users_per_page: 25,
  // Table columns
  show_2fa_column: true,
  show_oauth_status: true,
  show_last_login: true,
  show_created_at: true,
  show_email_verified: true,
  show_role_column: true,
  show_status_column: true,
  show_invited_by_column: false,
  show_tenant_column: false,
  // Search & filters
  show_user_search: true,
  user_search_fields: ['email', 'name', 'username'],
  show_user_filters: true,
  user_filter_options: ['role', 'status', '2fa_enabled', 'email_verified', 'created_date'],
  // User actions
  allow_user_creation: true,
  allow_user_deletion: true,
  allow_user_deactivation: true,
  allow_user_edit: true,
  allow_role_assignment: true,
  allow_password_reset: true,
  allow_email_verification_resend: true,
  allow_2fa_reset: true,
  allow_view_user_sessions: true,

  // ─────────────────────────────────────────────────────────────
  // SESSIONS TABLE
  // ─────────────────────────────────────────────────────────────
  sessions_per_page: 50,
  show_device_info: true,
  show_ip_address: true,
  show_location: false,
  show_session_filters: true,
  session_filter_options: ['user', 'device_type', 'date_range'],
  allow_session_revoke: true,
  allow_bulk_revoke: true,

  // ─────────────────────────────────────────────────────────────
  // INVITE SYSTEM
  // ─────────────────────────────────────────────────────────────
  show_invite_management: true,
  invites_per_page: 25,
  // Invite actions
  allow_send_invite: true,
  allow_resend_invite: true,
  allow_cancel_invite: true,
  allow_bulk_invite: true,
  // Invite form options
  invite_role_selection: true,
  invite_custom_message: true,
  invite_expiry_selection: false,
  // Invite list columns
  show_invite_status: true,
  show_invite_sent_by: true,
  show_invite_sent_date: true,
  show_invite_expiry_date: true,
  show_invite_accepted_date: true,
  // Pending invite approval
  show_pending_approvals: true,
  allow_approve_invite: true,
  allow_reject_invite: true,

  // ─────────────────────────────────────────────────────────────
  // IMPERSONATION
  // ─────────────────────────────────────────────────────────────
  show_impersonate_button: false,
  impersonate_warning_text: 'You are viewing as another user',
  impersonate_banner_color: 'warning',
  impersonate_end_button: true,

  // ─────────────────────────────────────────────────────────────
  // AUDIT LOG
  // ─────────────────────────────────────────────────────────────
  show_audit_log: true,
  audit_log_per_page: 50,
  audit_log_filters: ['event_type', 'user', 'admin', 'date_range', 'ip'],
  // Audit event categories
  audit_show_user_events: true,
  audit_show_admin_events: true,
  audit_show_invite_events: true,
  audit_show_impersonation_events: true,
  // Export
  audit_log_export: true,
  audit_export_formats: ['csv', 'json'],

  // ─────────────────────────────────────────────────────────────
  // SECURITY DASHBOARD
  // ─────────────────────────────────────────────────────────────
  show_security_dashboard: true,
  show_failed_login_chart: true,
  show_active_sessions_count: true,
  show_2fa_adoption_rate: true,
  show_lockout_alerts: true,
  show_recent_admin_actions: true,
  show_pending_invites_count: true,
  show_deactivated_users_count: true,

  // ─────────────────────────────────────────────────────────────
  // ROLES & PERMISSIONS
  // ─────────────────────────────────────────────────────────────
  show_roles_management: false,
  allow_role_creation: false,
  allow_role_deletion: false,
  allow_permission_edit: false,

  // ─────────────────────────────────────────────────────────────
  // MULTI-TENANT
  // ─────────────────────────────────────────────────────────────
  show_tenant_management: false,
  allow_tenant_creation: false,
  allow_tenant_deletion: false,
  tenants_per_page: 25,
};

export const configSchema: ConfigSchema = {
  type: 'object',
  properties: {
    // ─────────────────────────────────────────────────────────────
    // USERS TABLE
    // ─────────────────────────────────────────────────────────────
    users_per_page: {
      type: 'integer',
      minimum: 10,
      maximum: 100,
      description: 'Number of users per page',
      default: 25,
    },
    show_2fa_column: {
      type: 'boolean',
      description: 'Show 2FA status column in users table',
      default: true,
    },
    show_oauth_status: {
      type: 'boolean',
      description: 'Show OAuth provider connections',
      default: true,
    },
    show_last_login: {
      type: 'boolean',
      description: 'Show last login timestamp',
      default: true,
    },
    show_created_at: {
      type: 'boolean',
      description: 'Show account creation date',
      default: true,
    },
    show_email_verified: {
      type: 'boolean',
      description: 'Show email verification status',
      default: true,
    },
    show_role_column: {
      type: 'boolean',
      description: 'Show user role column',
      default: true,
    },
    show_status_column: {
      type: 'boolean',
      description: 'Show active/deactivated status column',
      default: true,
    },
    show_invited_by_column: {
      type: 'boolean',
      description: 'Show who invited this user',
      default: false,
    },
    show_tenant_column: {
      type: 'boolean',
      description: 'Show tenant column (for multi-tenant apps)',
      default: false,
    },
    // Search & filters
    show_user_search: {
      type: 'boolean',
      description: 'Show user search input',
      default: true,
    },
    user_search_fields: {
      type: 'array',
      items: { type: 'string', enum: ['email', 'name', 'username'] },
      description: 'Fields to search in',
      default: ['email', 'name', 'username'],
    },
    show_user_filters: {
      type: 'boolean',
      description: 'Show user filter dropdowns',
      default: true,
    },
    user_filter_options: {
      type: 'array',
      items: { type: 'string', enum: ['role', 'status', '2fa_enabled', 'email_verified', 'created_date'] },
      description: 'Available filter options',
      default: ['role', 'status', '2fa_enabled', 'email_verified', 'created_date'],
    },
    // User actions
    allow_user_creation: {
      type: 'boolean',
      description: 'Allow admins to create new users',
      default: true,
    },
    allow_user_deletion: {
      type: 'boolean',
      description: 'Allow admins to delete users (hard delete)',
      default: true,
    },
    allow_user_deactivation: {
      type: 'boolean',
      description: 'Allow admins to deactivate users (soft disable)',
      default: true,
    },
    allow_user_edit: {
      type: 'boolean',
      description: 'Allow admins to edit user details',
      default: true,
    },
    allow_role_assignment: {
      type: 'boolean',
      description: 'Allow admins to assign roles to users',
      default: true,
    },
    allow_password_reset: {
      type: 'boolean',
      description: 'Allow admins to force password reset',
      default: true,
    },
    allow_email_verification_resend: {
      type: 'boolean',
      description: 'Allow admins to resend verification emails',
      default: true,
    },
    allow_2fa_reset: {
      type: 'boolean',
      description: 'Allow admins to reset user 2FA/MFA',
      default: true,
    },
    allow_view_user_sessions: {
      type: 'boolean',
      description: 'Allow viewing sessions for specific user',
      default: true,
    },

    // ─────────────────────────────────────────────────────────────
    // SESSIONS TABLE
    // ─────────────────────────────────────────────────────────────
    sessions_per_page: {
      type: 'integer',
      minimum: 10,
      maximum: 100,
      description: 'Number of sessions per page',
      default: 50,
    },
    show_device_info: {
      type: 'boolean',
      description: 'Show device/browser info in sessions',
      default: true,
    },
    show_ip_address: {
      type: 'boolean',
      description: 'Show IP address in sessions',
      default: true,
    },
    show_location: {
      type: 'boolean',
      description: 'Show location from IP (requires geolocation)',
      default: false,
    },
    show_session_filters: {
      type: 'boolean',
      description: 'Show session filter options',
      default: true,
    },
    session_filter_options: {
      type: 'array',
      items: { type: 'string', enum: ['user', 'device_type', 'date_range'] },
      description: 'Available session filters',
      default: ['user', 'device_type', 'date_range'],
    },
    allow_session_revoke: {
      type: 'boolean',
      description: 'Allow admins to revoke user sessions',
      default: true,
    },
    allow_bulk_revoke: {
      type: 'boolean',
      description: 'Allow revoking all sessions for a user',
      default: true,
    },

    // ─────────────────────────────────────────────────────────────
    // INVITE SYSTEM
    // ─────────────────────────────────────────────────────────────
    show_invite_management: {
      type: 'boolean',
      description: 'Show invite management page',
      default: true,
    },
    invites_per_page: {
      type: 'integer',
      minimum: 10,
      maximum: 100,
      description: 'Number of invites per page',
      default: 25,
    },
    allow_send_invite: {
      type: 'boolean',
      description: 'Allow sending new invites',
      default: true,
    },
    allow_resend_invite: {
      type: 'boolean',
      description: 'Allow resending pending invites',
      default: true,
    },
    allow_cancel_invite: {
      type: 'boolean',
      description: 'Allow cancelling pending invites',
      default: true,
    },
    allow_bulk_invite: {
      type: 'boolean',
      description: 'Allow bulk invites via CSV upload',
      default: true,
    },
    invite_role_selection: {
      type: 'boolean',
      description: 'Allow selecting role for invitee',
      default: true,
    },
    invite_custom_message: {
      type: 'boolean',
      description: 'Allow custom message in invite email',
      default: true,
    },
    invite_expiry_selection: {
      type: 'boolean',
      description: 'Allow admin to set invite expiry',
      default: false,
    },
    show_invite_status: {
      type: 'boolean',
      description: 'Show invite status column',
      default: true,
    },
    show_invite_sent_by: {
      type: 'boolean',
      description: 'Show who sent the invite',
      default: true,
    },
    show_invite_sent_date: {
      type: 'boolean',
      description: 'Show when invite was sent',
      default: true,
    },
    show_invite_expiry_date: {
      type: 'boolean',
      description: 'Show invite expiry date',
      default: true,
    },
    show_invite_accepted_date: {
      type: 'boolean',
      description: 'Show when invite was accepted',
      default: true,
    },
    show_pending_approvals: {
      type: 'boolean',
      description: 'Show pending invite approvals (if approval required)',
      default: true,
    },
    allow_approve_invite: {
      type: 'boolean',
      description: 'Allow approving pending invites',
      default: true,
    },
    allow_reject_invite: {
      type: 'boolean',
      description: 'Allow rejecting pending invites',
      default: true,
    },

    // ─────────────────────────────────────────────────────────────
    // IMPERSONATION
    // ─────────────────────────────────────────────────────────────
    show_impersonate_button: {
      type: 'boolean',
      description: 'Show impersonate button (requires admin_impersonation in auth module)',
      default: false,
    },
    impersonate_warning_text: {
      type: 'string',
      description: 'Warning text shown during impersonation',
      default: 'You are viewing as another user',
    },
    impersonate_banner_color: {
      type: 'string',
      enum: ['warning', 'error', 'info'],
      description: 'Color of impersonation warning banner',
      default: 'warning',
    },
    impersonate_end_button: {
      type: 'boolean',
      description: 'Show end impersonation button in banner',
      default: true,
    },

    // ─────────────────────────────────────────────────────────────
    // AUDIT LOG
    // ─────────────────────────────────────────────────────────────
    show_audit_log: {
      type: 'boolean',
      description: 'Show audit log page',
      default: true,
    },
    audit_log_per_page: {
      type: 'integer',
      minimum: 10,
      maximum: 100,
      description: 'Number of audit entries per page',
      default: 50,
    },
    audit_log_filters: {
      type: 'array',
      items: { type: 'string', enum: ['event_type', 'user', 'admin', 'date_range', 'ip'] },
      description: 'Available audit log filters',
      default: ['event_type', 'user', 'admin', 'date_range', 'ip'],
    },
    audit_show_user_events: {
      type: 'boolean',
      description: 'Show user events (login, logout, password change)',
      default: true,
    },
    audit_show_admin_events: {
      type: 'boolean',
      description: 'Show admin events (user created, deleted, role changed)',
      default: true,
    },
    audit_show_invite_events: {
      type: 'boolean',
      description: 'Show invite events (sent, accepted, rejected)',
      default: true,
    },
    audit_show_impersonation_events: {
      type: 'boolean',
      description: 'Show impersonation events (start, end)',
      default: true,
    },
    audit_log_export: {
      type: 'boolean',
      description: 'Allow export of audit log',
      default: true,
    },
    audit_export_formats: {
      type: 'array',
      items: { type: 'string', enum: ['csv', 'json'] },
      description: 'Available export formats',
      default: ['csv', 'json'],
    },

    // ─────────────────────────────────────────────────────────────
    // SECURITY DASHBOARD
    // ─────────────────────────────────────────────────────────────
    show_security_dashboard: {
      type: 'boolean',
      description: 'Show security overview dashboard',
      default: true,
    },
    show_failed_login_chart: {
      type: 'boolean',
      description: 'Show failed login attempts chart',
      default: true,
    },
    show_active_sessions_count: {
      type: 'boolean',
      description: 'Show active sessions count',
      default: true,
    },
    show_2fa_adoption_rate: {
      type: 'boolean',
      description: 'Show 2FA adoption rate metric',
      default: true,
    },
    show_lockout_alerts: {
      type: 'boolean',
      description: 'Show recent account lockout alerts',
      default: true,
    },
    show_recent_admin_actions: {
      type: 'boolean',
      description: 'Show recent admin activity feed',
      default: true,
    },
    show_pending_invites_count: {
      type: 'boolean',
      description: 'Show pending invites count',
      default: true,
    },
    show_deactivated_users_count: {
      type: 'boolean',
      description: 'Show deactivated users count',
      default: true,
    },

    // ─────────────────────────────────────────────────────────────
    // ROLES & PERMISSIONS
    // ─────────────────────────────────────────────────────────────
    show_roles_management: {
      type: 'boolean',
      description: 'Show roles management (requires dynamic_roles in auth module)',
      default: false,
    },
    allow_role_creation: {
      type: 'boolean',
      description: 'Allow creating new roles',
      default: false,
    },
    allow_role_deletion: {
      type: 'boolean',
      description: 'Allow deleting roles',
      default: false,
    },
    allow_permission_edit: {
      type: 'boolean',
      description: 'Allow editing role permissions',
      default: false,
    },

    // ─────────────────────────────────────────────────────────────
    // MULTI-TENANT
    // ─────────────────────────────────────────────────────────────
    show_tenant_management: {
      type: 'boolean',
      description: 'Show tenant management (requires multi_tenant in auth module)',
      default: false,
    },
    allow_tenant_creation: {
      type: 'boolean',
      description: 'Allow creating new tenants',
      default: false,
    },
    allow_tenant_deletion: {
      type: 'boolean',
      description: 'Allow deleting tenants',
      default: false,
    },
    tenants_per_page: {
      type: 'integer',
      minimum: 10,
      maximum: 100,
      description: 'Number of tenants per page',
      default: 25,
    },
  },
};
