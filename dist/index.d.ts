/**
 * @hit/feature-pack-auth-admin
 *
 * Admin dashboard feature pack for user management, sessions, and audit logs.
 *
 * Components are exported individually for optimal tree-shaking.
 * When used with the route loader system, only the requested component is bundled.
 *
 * @example
 * ```tsx
 * import { Dashboard, Users, UserDetail } from '@hit/feature-pack-auth-admin';
 *
 * // Use in your app's routes
 * <Route path="/admin" element={<Dashboard />} />
 * <Route path="/admin/users" element={<Users />} />
 * <Route path="/admin/users/:email" element={<UserDetail email={params.email} />} />
 * ```
 */
export { Dashboard, DashboardPage, Users, UsersPage, UserDetail, UserDetailPage, Sessions, SessionsPage, AuditLog, AuditLogPage, Invites, InvitesPage, } from './pages/index';
export * from './components/index';
export * from './hooks/index';
export { nav } from './nav';
//# sourceMappingURL=index.d.ts.map