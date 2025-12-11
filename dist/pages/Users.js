'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Eye, Key, Trash2, UserPlus, Lock, Unlock } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { formatDate } from '@hit/sdk';
import { useUsers, useUserMutations, useAuthAdminConfig } from '../hooks/useAuthAdmin';
export function Users({ onNavigate }) {
    const { Page, Card, Button, Badge, Table, Modal, Input, Alert, Spinner } = useUi();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    // Form state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const { data, loading, error, refresh } = useUsers({
        page,
        pageSize: 25,
        search,
        sortBy: 'created_at',
        sortOrder: 'desc',
    });
    const { createUser, deleteUser, resetPassword, lockUser, unlockUser, loading: mutating } = useUserMutations();
    const { config: adminConfig } = useAuthAdminConfig();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleCreateUser = async () => {
        try {
            await createUser({ email: newEmail, password: newPassword });
            setCreateModalOpen(false);
            setNewEmail('');
            setNewPassword('');
            refresh();
        }
        catch {
            // Error handled by hook
        }
    };
    const handleDeleteUser = async () => {
        if (!selectedUser)
            return;
        try {
            await deleteUser(selectedUser.email);
            setDeleteModalOpen(false);
            setSelectedUser(null);
            refresh();
        }
        catch {
            // Error handled by hook
        }
    };
    const handleResetPassword = async (email) => {
        if (confirm(`Send password reset email to ${email}?`)) {
            try {
                await resetPassword(email);
                alert('Password reset email sent!');
            }
            catch {
                // Error handled by hook
            }
        }
    };
    const handleToggleLock = async (user) => {
        const action = user.locked ? unlockUser : lockUser;
        const actionName = user.locked ? 'unlock' : 'lock';
        if (confirm(`Are you sure you want to ${actionName} ${user.email}?`)) {
            try {
                await action(user.email);
                refresh();
            }
            catch {
                // Error handled by hook
            }
        }
    };
    const formatDateOrNever = (dateStr) => {
        if (!dateStr)
            return 'Never';
        return formatDate(dateStr);
    };
    return (_jsxs(Page, { title: "Users", description: "Manage user accounts", actions: adminConfig?.allow_signup !== false ? (_jsxs(Button, { variant: "primary", onClick: () => setCreateModalOpen(true), children: [_jsx(UserPlus, { size: 16, className: "mr-2" }), "Add User"] })) : null, children: [_jsx(Card, { children: _jsx("div", { className: "max-w-md", children: _jsx(Input, { label: "Search Users", value: search, onChange: setSearch, placeholder: "Search by email..." }) }) }), error && (_jsx(Alert, { variant: "error", title: "Error loading users", children: error.message })), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : (_jsxs(_Fragment, { children: [_jsx(Table, { columns: [
                                {
                                    key: 'email',
                                    label: 'Email',
                                    render: (_, row) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium", children: String(row.email) }), row.locked ? _jsx(Lock, { size: 14, className: "text-red-500" }) : null] })),
                                },
                                {
                                    key: 'email_verified',
                                    label: 'Verified',
                                    render: (value) => (_jsx(Badge, { variant: value ? 'success' : 'warning', children: value ? 'Verified' : 'Pending' })),
                                },
                                ...(adminConfig?.two_factor_auth !== false
                                    ? [
                                        {
                                            key: 'two_factor_enabled',
                                            label: '2FA',
                                            render: (value) => (_jsx(Badge, { variant: value ? 'success' : 'default', children: value ? 'Enabled' : 'Disabled' })),
                                        },
                                    ]
                                    : []),
                                {
                                    key: 'role',
                                    label: 'Role',
                                    render: (value) => {
                                        // Support both new single role and legacy roles array
                                        const userRole = value?.role
                                            || (value?.roles && value.roles.length > 0
                                                ? value.roles[0]
                                                : 'user')
                                            || 'user';
                                        return (_jsx(Badge, { variant: userRole === 'admin' ? 'info' : 'default', children: userRole }));
                                    },
                                },
                                {
                                    key: 'created_at',
                                    label: 'Created',
                                    render: (value) => formatDateOrNever(value),
                                },
                                {
                                    key: 'last_login',
                                    label: 'Last Login',
                                    render: (value) => formatDateOrNever(value),
                                },
                                {
                                    key: 'actions',
                                    label: '',
                                    align: 'right',
                                    render: (_, row) => {
                                        const user = row;
                                        return (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate(`/admin/users/${encodeURIComponent(user.email)}`), children: _jsx(Eye, { size: 16 }) }), adminConfig?.password_reset !== false && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleResetPassword(user.email), children: _jsx(Key, { size: 16 }) })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleToggleLock(user), children: user.locked ? _jsx(Unlock, { size: 16 }) : _jsx(Lock, { size: 16 }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                        setSelectedUser(user);
                                                        setDeleteModalOpen(true);
                                                    }, children: _jsx(Trash2, { size: 16, className: "text-red-500" }) })] }));
                                    },
                                },
                            ], data: (data?.items || []).map((user) => ({
                                email: user.email,
                                email_verified: user.email_verified,
                                ...(adminConfig?.two_factor_auth !== false
                                    ? { two_factor_enabled: user.two_factor_enabled }
                                    : {}),
                                role: user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'user') || 'user',
                                roles: user.roles, // Keep for backwards compatibility
                                created_at: user.created_at,
                                last_login: user.last_login,
                                locked: user.locked,
                            })), onRowClick: (row) => navigate(`/admin/users/${encodeURIComponent(row.email)}`), emptyMessage: "No users found" }), data && data.total_pages > 1 && (_jsxs("div", { className: "flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-800", children: [_jsxs("p", { className: "text-sm text-gray-400", children: ["Page ", data.page, " of ", data.total_pages, " (", data.total, " users)"] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "secondary", size: "md", disabled: page === 1, onClick: () => setPage(page - 1), children: "Previous" }), _jsx(Button, { variant: "secondary", size: "md", disabled: page >= data.total_pages, onClick: () => setPage(page + 1), children: "Next" })] })] }))] })) }), _jsx(Modal, { open: createModalOpen, onClose: () => setCreateModalOpen(false), title: "Create New User", description: "Add a new user to the system", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Email", type: "email", value: newEmail, onChange: setNewEmail, placeholder: "user@example.com", required: true }), _jsx(Input, { label: "Initial Password", type: "password", value: newPassword, onChange: setNewPassword, placeholder: "Minimum 8 characters", required: true }), _jsx("p", { className: "text-xs text-gray-400", children: "User can change this after first login" }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => setCreateModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleCreateUser, loading: mutating, disabled: !newEmail || !newPassword, children: "Create User" })] })] }) }), _jsx(Modal, { open: deleteModalOpen, onClose: () => setDeleteModalOpen(false), title: "Delete User", description: "This action cannot be undone", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-300", children: ["Are you sure you want to delete", ' ', _jsx("strong", { className: "text-gray-900 dark:text-gray-100", children: selectedUser?.email }), "?"] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => setDeleteModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDeleteUser, loading: mutating, children: "Delete User" })] })] }) })] }));
}
export default Users;
//# sourceMappingURL=Users.js.map