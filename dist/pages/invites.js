/**
 * Invite Management Page Generator
 */
export async function invites(ctx) {
    const options = ctx.options;
    const authUrl = ctx.moduleUrls.auth;
    const { userRoles } = ctx;
    // Check admin permission
    if (!userRoles.includes('admin')) {
        return {
            type: 'Alert',
            variant: 'error',
            title: 'Access Denied',
            message: 'You do not have permission to manage invites.',
        };
    }
    if (!options.show_invite_management) {
        return {
            type: 'Page',
            children: [
                {
                    type: 'Alert',
                    variant: 'error',
                    title: 'Invite management is not available',
                    message: 'Invite system is not enabled',
                },
            ],
        };
    }
    return {
        type: 'Page',
        title: 'User Invites',
        description: 'Manage user invitations',
        children: [
            {
                type: 'Card',
                className: 'mb-6',
                children: [
                    {
                        type: 'DataTable',
                        endpoint: `${authUrl}/invites`,
                        columns: [
                            { key: 'email', label: 'Email', type: 'text' },
                            { key: 'inviter_email', label: 'Sent By', type: 'text' },
                            { key: 'status', label: 'Status', type: 'badge' },
                            { key: 'created_at', label: 'Sent Date', type: 'datetime' },
                            { key: 'expires_at', label: 'Expires', type: 'datetime' },
                        ],
                        pageSize: options.invites_per_page || 25,
                        emptyMessage: 'No invites found',
                    },
                ],
            },
        ],
    };
}
//# sourceMappingURL=invites.js.map