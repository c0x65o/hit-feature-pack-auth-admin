/**
 * @hit/feature-pack-auth-admin
 *
 * Admin dashboard feature pack for user management, sessions, and 2FA.
 */

import { dashboard } from './pages/dashboard';
import { users } from './pages/users';
import { userDetail } from './pages/userDetail';
import { sessions } from './pages/sessions';
import { auditLog } from './pages/audit-log';
import { invites } from './pages/invites';
import { navContributions } from './nav';
import { configSchema, configDefaults } from './config';
import type { FeaturePackModule, FeaturePackMetadata, RouteDefinition } from '@hit/feature-pack-types';

// Page generators - ui-render calls these
export const pages = {
  dashboard,
  users,
  userDetail,
  sessions,
  auditLog,
  invites,
};

// Route definitions - maps paths to page generators
// Note: auth-admin typically uses mount_base: /admin in hit.yaml
// These paths are relative - mount_base is prepended by ui-render
export const routes: RouteDefinition[] = [
  { path: '/admin', page: 'dashboard', priority: 100 },
  { path: '/admin/dashboard', page: 'dashboard', priority: 100 },
  { path: '/admin/users', page: 'users', priority: 100 },
  { path: '/admin/users/:email', page: 'userDetail', priority: 50 },
  { path: '/admin/sessions', page: 'sessions', priority: 100 },
  { path: '/admin/audit-log', page: 'auditLog', priority: 100 },
  { path: '/admin/invites', page: 'invites', priority: 100 },
];

// Navigation contributions
export { navContributions };

// Config schema for CAC admin
export { configSchema, configDefaults };

// Feature pack metadata
export const metadata: FeaturePackMetadata = {
  name: 'auth-admin',
  version: '1.0.0',
  description: 'Admin dashboard for users, sessions, 2FA',
};

// Export the full module interface
const authAdminModule: FeaturePackModule = {
  pages,
  navContributions,
  configSchema,
  configDefaults,
  metadata,
  routes,
};

export default authAdminModule;
