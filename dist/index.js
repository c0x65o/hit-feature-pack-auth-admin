/**
 * @hit/feature-pack-auth-admin
 *
 * Admin dashboard feature pack for user management, sessions, and 2FA.
 */
import { dashboard } from './pages/dashboard';
import { users } from './pages/users';
import { userDetail } from './pages/userDetail';
import { sessions } from './pages/sessions';
import { navContributions } from './nav';
import { configSchema, configDefaults } from './config';
// Page generators - ui-render calls these
export const pages = {
    dashboard,
    users,
    userDetail,
    sessions,
};
// Navigation contributions
export { navContributions };
// Config schema for CAC admin
export { configSchema, configDefaults };
// Feature pack metadata
export const metadata = {
    name: 'auth-admin',
    version: '1.0.0',
    description: 'Admin dashboard for users, sessions, 2FA',
};
// Export the full module interface
const authAdminModule = {
    pages,
    navContributions,
    configSchema,
    configDefaults,
    metadata,
};
export default authAdminModule;
//# sourceMappingURL=index.js.map