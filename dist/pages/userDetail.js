/**
 * User Detail Page Generator
 */
export async function userDetail(ctx) {
    const { moduleUrls, options, userRoles } = ctx;
    const opts = options;
    // Check admin permission
    if (!userRoles.includes('admin')) {
        return {
            type: 'Alert',
            variant: 'error',
            title: 'Access Denied',
            message: 'You do not have permission to view user details.',
        };
    }
    // moduleUrls.auth is a proxy path (e.g., '/api/proxy/auth')
    // The shell app proxies these requests to the internal auth module
    const authUrl = moduleUrls.auth;
    return {
        type: 'Page',
        title: 'User Details',
        description: 'View and manage user account',
        actions: [
            {
                type: 'Button',
                label: 'Back to Users',
                variant: 'outline',
                icon: 'arrow-left',
                onClick: {
                    type: 'navigate',
                    to: '/admin/users',
                },
            },
        ],
        children: [
            // User info loaded async
            {
                type: 'Async',
                endpoint: `${authUrl}/admin/users/{email}`,
                loading: {
                    type: 'Loading',
                    variant: 'skeleton',
                },
                error: {
                    type: 'Alert',
                    variant: 'error',
                    message: 'Failed to load user details',
                },
            },
            // Actions Card
            {
                type: 'Card',
                title: 'Actions',
                className: 'mt-6',
                children: [
                    {
                        type: 'Row',
                        gap: 12,
                        children: [
                            ...(opts.allow_password_reset
                                ? [
                                    {
                                        type: 'Button',
                                        label: 'Send Password Reset',
                                        variant: 'outline',
                                        icon: 'mail',
                                        onClick: {
                                            type: 'api',
                                            method: 'POST',
                                            endpoint: `${authUrl}/admin/users/{email}/reset-password`,
                                            onSuccess: {
                                                type: 'openModal',
                                                modal: {
                                                    type: 'Modal',
                                                    title: 'Email Sent',
                                                    size: 'sm',
                                                    children: [
                                                        {
                                                            type: 'Text',
                                                            content: 'Password reset email has been sent.',
                                                        },
                                                    ],
                                                    footer: [
                                                        {
                                                            type: 'Button',
                                                            label: 'OK',
                                                            variant: 'primary',
                                                            onClick: { type: 'closeModal' },
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                ]
                                : []),
                            ...(opts.allow_session_revoke
                                ? [
                                    {
                                        type: 'Button',
                                        label: 'Revoke All Sessions',
                                        variant: 'outline',
                                        icon: 'log-out',
                                        onClick: {
                                            type: 'api',
                                            method: 'DELETE',
                                            endpoint: `${authUrl}/admin/users/{email}/sessions`,
                                            confirm: 'This will log the user out of all devices. Continue?',
                                            onSuccess: {
                                                type: 'refresh',
                                            },
                                        },
                                    },
                                ]
                                : []),
                            ...(opts.show_impersonate_button
                                ? [
                                    {
                                        type: 'Button',
                                        label: 'Impersonate User',
                                        variant: 'outline',
                                        icon: 'user-cog',
                                        onClick: {
                                            type: 'api',
                                            method: 'POST',
                                            endpoint: `${authUrl}/impersonate/start`,
                                            body: {
                                                user_email: '{email}',
                                            },
                                            onSuccess: {
                                                type: 'navigate',
                                                to: '/',
                                            },
                                        },
                                    },
                                ]
                                : []),
                            ...(opts.allow_user_deletion
                                ? [
                                    {
                                        type: 'Button',
                                        label: 'Delete User',
                                        variant: 'danger',
                                        icon: 'trash',
                                        onClick: {
                                            type: 'api',
                                            method: 'DELETE',
                                            endpoint: `${authUrl}/admin/users/{email}`,
                                            confirm: 'Are you sure you want to delete this user? This action cannot be undone.',
                                            onSuccess: {
                                                type: 'navigate',
                                                to: '/admin/users',
                                            },
                                        },
                                    },
                                ]
                                : []),
                        ],
                    },
                ],
            },
            // User Sessions
            {
                type: 'Card',
                title: 'Active Sessions',
                className: 'mt-6',
                children: [
                    {
                        type: 'DataTable',
                        endpoint: `${authUrl}/admin/users/{email}/sessions`,
                        columns: [
                            { key: 'device', label: 'Device', type: 'text' },
                            { key: 'ip_address', label: 'IP Address', type: 'text' },
                            { key: 'location', label: 'Location', type: 'text' },
                            { key: 'last_active', label: 'Last Active', type: 'datetime' },
                            { key: 'created_at', label: 'Started', type: 'datetime' },
                        ],
                        pageSize: 10,
                        emptyMessage: 'No active sessions',
                        rowActions: opts.allow_session_revoke
                            ? [
                                {
                                    type: 'Button',
                                    label: 'Revoke',
                                    variant: 'danger',
                                    size: 'sm',
                                    onClick: {
                                        type: 'api',
                                        method: 'DELETE',
                                        endpoint: `${authUrl}/admin/sessions/{id}`,
                                        onSuccess: {
                                            type: 'refresh',
                                        },
                                    },
                                },
                            ]
                            : [],
                    },
                ],
            },
            // Activity Log
            {
                type: 'Card',
                title: 'Recent Activity',
                className: 'mt-6',
                children: [
                    {
                        type: 'DataTable',
                        endpoint: `${authUrl}/admin/users/{email}/activity`,
                        columns: [
                            { key: 'action', label: 'Action', type: 'badge' },
                            { key: 'ip_address', label: 'IP Address', type: 'text' },
                            { key: 'user_agent', label: 'Device', type: 'text' },
                            { key: 'created_at', label: 'Time', type: 'datetime' },
                        ],
                        pageSize: 20,
                        emptyMessage: 'No activity recorded',
                    },
                ],
            },
        ],
    };
}
//# sourceMappingURL=userDetail.js.map