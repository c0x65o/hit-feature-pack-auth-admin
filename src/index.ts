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
import type { FeaturePackModule, FeaturePackMetadata } from '@hit/feature-pack-types';

// Page generators - ui-render calls these
export const pages = {
  dashboard,
  users,
  userDetail,
  sessions,
  auditLog,
  invites,
};

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
};

export default authAdminModule;
