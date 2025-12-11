/**
 * Navigation configuration for auth-admin feature pack
 */
export const nav = [
    {
        id: 'admin',
        label: 'Admin',
        path: '/admin',
        icon: 'shield',
        roles: ['admin'],
        children: [
            { label: 'Dashboard', path: '/admin', icon: 'layout-dashboard' },
            { label: 'Users', path: '/admin/users', icon: 'users' },
            { label: 'Permissions', path: '/admin/permissions', icon: 'shield' },
            { label: 'Sessions', path: '/admin/sessions', icon: 'key' },
            { label: 'Audit Log', path: '/admin/audit-log', icon: 'file-text' },
            { label: 'Invites', path: '/admin/invites', icon: 'mail' },
        ],
    },
];
//# sourceMappingURL=nav.js.map