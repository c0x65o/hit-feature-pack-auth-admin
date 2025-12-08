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
import type { FeaturePackModule, FeaturePackMetadata } from '@hit/feature-pack-types';
export declare const pages: {
    dashboard: typeof dashboard;
    users: typeof users;
    userDetail: typeof userDetail;
    sessions: typeof sessions;
};
export { navContributions };
export { configSchema, configDefaults };
export declare const metadata: FeaturePackMetadata;
declare const authAdminModule: FeaturePackModule;
export default authAdminModule;
//# sourceMappingURL=index.d.ts.map