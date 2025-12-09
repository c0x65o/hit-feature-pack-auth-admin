/**
 * @hit/feature-pack-auth-admin
 *
 * Admin dashboard feature pack for user management, sessions, and audit logs.
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
export * from './pages/index';
export * from './components/index';
export * from './hooks/index';
export { nav } from './nav';
//# sourceMappingURL=index.d.ts.map