/**
 * Users Management Page Generator
 */
export async function users(ctx) {
    const { moduleUrls, options, userRoles } = ctx;
    const opts = options;
    // Check admin permission
    if (!userRoles.includes('admin')) {
        return {
            type: 'Alert',
            variant: 'error',
            title: 'Access Denied',
            message: 'You do not have permission to manage users.',
        };
    }
    // moduleUrls.auth is a proxy path (e.g., '/api/proxy/auth')
    // The shell app proxies these requests to the internal auth module
    const authUrl = moduleUrls.auth;
    // Build columns based on options
    const columns = [
        { key: 'email', label: 'Email', type: 'text', sortable: true },
        {
            key: 'email_verified',
            label: 'Verified',
            type: 'badge',
            badgeColors: {
                true: 'success',
                false: 'warning',
            },
        },
    ];
    if (opts.show_2fa_column) {
        columns.push({
            key: 'two_factor_enabled',
            label: '2FA',
            type: 'badge',
            badgeColors: {
                true: 'success',
                false: 'default',
            },
        });
    }
    if (opts.show_oauth_status) {
        columns.push({
            key: 'oauth_providers',
            label: 'OAuth',
            type: 'text',
        });
    }
    columns.push({ key: 'created_at', label: 'Created', type: 'datetime', sortable: true }, { key: 'last_login', label: 'Last Login', type: 'datetime', sortable: true });
    // Build row actions
    const rowActions = [
        {
            type: 'Button',
            label: 'View',
            variant: 'ghost',
            icon: 'eye',
            onClick: {
                type: 'navigate',
                to: '/admin/users/{email}',
            },
        },
    ];
    if (opts.allow_password_reset) {
        rowActions.push({
            type: 'Button',
            label: 'Reset Password',
            variant: 'ghost',
            icon: 'key',
            onClick: {
                type: 'api',
                method: 'POST',
                endpoint: `${authUrl}/admin/users/{email}/reset-password`,
                confirm: 'Send password reset email to this user?',
                onSuccess: {
                    type: 'openModal',
                    modal: {
                        type: 'Modal',
                        title: 'Password Reset Sent',
                        size: 'sm',
                        children: [
                            {
                                type: 'Text',
                                content: 'A password reset email has been sent to the user.',
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
        });
    }
    if (opts.allow_user_deletion) {
        rowActions.push({
            type: 'Button',
            label: 'Delete',
            variant: 'danger',
            icon: 'trash',
            onClick: {
                type: 'api',
                method: 'DELETE',
                endpoint: `${authUrl}/admin/users/{email}`,
                confirm: 'Are you sure you want to delete this user? This action cannot be undone.',
                onSuccess: {
                    type: 'refresh',
                },
            },
        });
    }
    // Build page actions
    const pageActions = [];
    if (opts.allow_user_creation) {
        pageActions.push({
            type: 'Button',
            label: 'Add User',
            variant: 'primary',
            icon: 'user-plus',
            onClick: {
                type: 'openModal',
                modal: {
                    type: 'Modal',
                    id: 'create-user',
                    title: 'Create New User',
                    size: 'md',
                    children: [
                        {
                            type: 'Form',
                            id: 'create-user-form',
                            endpoint: `${authUrl}/admin/users`,
                            method: 'POST',
                            fields: [
                                {
                                    type: 'TextField',
                                    name: 'email',
                                    label: 'Email',
                                    inputType: 'email',
                                    required: true,
                                    validation: [
                                        { type: 'required', message: 'Email is required' },
                                        { type: 'email', message: 'Please enter a valid email' },
                                    ],
                                },
                                {
                                    type: 'TextField',
                                    name: 'password',
                                    label: 'Initial Password',
                                    inputType: 'password',
                                    required: true,
                                    helpText: 'User can change this after first login',
                                    validation: [
                                        { type: 'required', message: 'Password is required' },
                                        { type: 'min', value: 8, message: 'Password must be at least 8 characters' },
                                    ],
                                },
                                {
                                    type: 'Checkbox',
                                    name: 'send_welcome_email',
                                    checkboxLabel: 'Send welcome email with login instructions',
                                },
                            ],
                            submitText: 'Create User',
                            onSuccess: {
                                type: 'refresh',
                            },
                        },
                    ],
                },
            },
        });
    }
    return {
        type: 'Page',
        title: 'Users',
        description: 'Manage user accounts',
        actions: pageActions,
        children: [
            {
                type: 'DataTable',
                endpoint: `${authUrl}/admin/users`,
                columns,
                pageSize: opts.users_per_page || 25,
                pagination: true,
                searchable: true,
                sortable: true,
                rowActions,
                emptyMessage: 'No users found',
            },
        ],
    };
}
//# sourceMappingURL=users.js.map