/**
 * Navigation contributions for auth-admin feature pack
 */
export const navContributions = [
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
];
//# sourceMappingURL=nav.js.map