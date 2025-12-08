/**
 * Navigation contributions for auth-admin feature pack
 */

import type { NavContribution } from '@hit/feature-pack-types';

export const navContributions: NavContribution[] = [
  {
    id: 'auth.admin.dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    slots: ['sidebar.primary'],
    permissions: ['role:admin'],
    order: 10,
    icon: 'dashboard',
  },
  {
    id: 'auth.admin.users',
    label: 'Users',
    path: '/admin/users',
    slots: ['sidebar.primary'],
    permissions: ['role:admin'],
    order: 20,
    icon: 'users',
  },
  {
    id: 'auth.admin.sessions',
    label: 'Sessions',
    path: '/admin/sessions',
    slots: ['sidebar.primary'],
    permissions: ['role:admin'],
    order: 30,
    icon: 'key',
  },
  {
    id: 'auth.admin.invites',
    label: 'Invites',
    path: '/admin/invites',
    slots: ['sidebar.primary'],
    permissions: ['role:admin'],
    order: 40,
    icon: 'mail',
  },
  {
    id: 'auth.admin.audit-log',
    label: 'Audit Log',
    path: '/admin/audit-log',
    slots: ['sidebar.primary'],
    permissions: ['role:admin'],
    order: 50,
    icon: 'file-text',
  },
];
