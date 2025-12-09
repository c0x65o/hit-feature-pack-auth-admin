'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeft, Shield, Key, Lock, Unlock, Trash2, Monitor, Globe, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useUser, useSessions, useUserMutations, useSessionMutations, } from '../hooks/useAuthAdmin';
export function UserDetail({ email, onNavigate }) {
    const { Page, Card, Button, Badge, Table, Modal, Alert, Spinner, EmptyState, Checkbox } = useUi();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [rolesModalOpen, setRolesModalOpen] = useState(false);
    const [newRoles, setNewRoles] = useState([]);
    const { user, loading, error, refresh } = useUser(email);
    const { data: sessionsData, refresh: refreshSessions } = useSessions({ search: email });
    const { deleteUser, resetPassword, updateRoles, lockUser, unlockUser, loading: mutating, } = useUserMutations();
    const { revokeSession, revokeAllUserSessions } = useSessionMutations();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleDeleteUser = async () => {
        try {
            await deleteUser(email);
            navigate('/admin/users');
        }
        catch {
            // Error handled by hook
        }
    };
    const handleResetPassword = async () => {
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
    const handleToggleLock = async () => {
        const action = user?.locked ? unlockUser : lockUser;
        const actionName = user?.locked ? 'unlock' : 'lock';
        if (confirm(`Are you sure you want to ${actionName} this user?`)) {
            try {
                await action(email);
                refresh();
            }
            catch {
                // Error handled by hook
            }
        }
    };
    const handleUpdateRoles = async () => {
        try {
            await updateRoles(email, newRoles);
            setRolesModalOpen(false);
            refresh();
        }
        catch {
            // Error handled by hook
        }
    };
    const handleRevokeSession = async (sessionId) => {
        if (confirm('Revoke this session?')) {
            try {
                await revokeSession(sessionId);
                refreshSessions();
            }
            catch {
                // Error handled by hook
            }
        }
    };
    const handleRevokeAllSessions = async () => {
        if (confirm('Revoke all sessions for this user?')) {
            try {
                await revokeAllUserSessions(email);
                refreshSessions();
            }
            catch {
                // Error handled by hook
            }
        }
    };
    const formatDate = (dateStr) => {
        if (!dateStr)
            return 'Never';
        return new Date(dateStr).toLocaleString();
    };
    const openRolesModal = () => {
        setNewRoles(user?.roles || []);
        setRolesModalOpen(true);
    };
    const toggleRole = (role) => {
        setNewRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
    };
    if (loading) {
        return (_jsx(Page, { title: "Loading...", children: _jsx(Card, { children: _jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }) }));
    }
    if (error || !user) {
        return (_jsx(Page, { title: "User Not Found", actions: _jsxs(Button, { variant: "secondary", onClick: () => navigate('/admin/users'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to Users"] }), children: _jsx(Alert, { variant: "error", title: "Error", children: error?.message || 'User not found' }) }));
    }
    return (_jsxs(Page, { title: user.email, description: user.locked ? 'This account is locked' : undefined, actions: _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { variant: "secondary", onClick: () => navigate('/admin/users'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back"] }), _jsxs(Button, { variant: "secondary", onClick: handleResetPassword, disabled: mutating, children: [_jsx(Key, { size: 16, className: "mr-2" }), "Reset Password"] }), _jsxs(Button, { variant: "secondary", onClick: handleToggleLock, disabled: mutating, children: [user.locked ? _jsx(Unlock, { size: 16, className: "mr-2" }) : _jsx(Lock, { size: 16, className: "mr-2" }), user.locked ? 'Unlock' : 'Lock'] }), _jsxs(Button, { variant: "danger", onClick: () => setDeleteModalOpen(true), children: [_jsx(Trash2, { size: 16, className: "mr-2" }), "Delete"] })] }), children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "Account Details", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Email" }), _jsx("span", { className: "text-gray-100", children: user.email })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Verified" }), _jsx(Badge, { variant: user.email_verified ? 'success' : 'warning', children: user.email_verified ? 'Yes' : 'No' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "2FA" }), _jsx(Badge, { variant: user.two_factor_enabled ? 'success' : 'default', children: user.two_factor_enabled ? 'Enabled' : 'Disabled' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Status" }), _jsx(Badge, { variant: user.locked ? 'error' : 'success', children: user.locked ? 'Locked' : 'Active' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Created" }), _jsx("span", { className: "text-gray-100", children: formatDate(user.created_at) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Last Login" }), _jsx("span", { className: "text-gray-100", children: formatDate(user.last_login ?? null) })] })] }) }), _jsx(Card, { title: "Roles", footer: _jsx("div", { className: "px-6 py-4", children: _jsxs(Button, { variant: "secondary", size: "sm", onClick: openRolesModal, children: [_jsx(Shield, { size: 16, className: "mr-2" }), "Edit Roles"] }) }), children: _jsx("div", { className: "flex flex-wrap gap-2 p-6", children: (user.roles || []).map((role) => (_jsx(Badge, { variant: role === 'admin' ? 'info' : 'default', children: role }, role))) }) })] }), _jsx(Card, { title: "Active Sessions", footer: sessionsData?.items?.length ? (_jsx("div", { className: "px-6 py-4", children: _jsx(Button, { variant: "danger", size: "sm", onClick: handleRevokeAllSessions, children: "Revoke All Sessions" }) })) : undefined, children: !sessionsData?.items?.length ? (_jsx("div", { className: "p-6", children: _jsx(EmptyState, { icon: _jsx(Monitor, { size: 48 }), title: "No active sessions", description: "This user has no active sessions" }) })) : (_jsx(Table, { columns: [
                        {
                            key: 'ip_address',
                            label: 'IP Address',
                            render: (value) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Globe, { size: 16, className: "text-gray-400" }), _jsx("span", { className: "font-mono text-sm", children: value })] })),
                        },
                        {
                            key: 'created_at',
                            label: 'Started',
                            render: (value) => formatDate(value),
                        },
                        {
                            key: 'current',
                            label: 'Status',
                            render: (value) => (_jsx(Badge, { variant: value ? 'success' : 'default', children: value ? 'Current' : 'Active' })),
                        },
                        {
                            key: 'actions',
                            label: '',
                            align: 'right',
                            render: (_, row) => {
                                if (row.current)
                                    return null;
                                return (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRevokeSession(row.id), children: _jsx(Trash2, { size: 16, className: "text-red-500" }) }));
                            },
                        },
                    ], data: (sessionsData?.items || []).map((s) => ({
                        id: s.id,
                        ip_address: s.ip_address,
                        created_at: s.created_at,
                        current: s.current,
                    })) })) }), _jsx(Modal, { open: deleteModalOpen, onClose: () => setDeleteModalOpen(false), title: "Delete User", description: "This action cannot be undone", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-300", children: ["Are you sure you want to delete ", _jsx("strong", { className: "text-gray-100", children: user.email }), "?"] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => setDeleteModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDeleteUser, loading: mutating, children: "Delete User" })] })] }) }), _jsx(Modal, { open: rolesModalOpen, onClose: () => setRolesModalOpen(false), title: "Edit Roles", description: "Select the roles for this user", children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "space-y-2", children: ['user', 'admin', 'moderator'].map((role) => (_jsx(Checkbox, { label: role.charAt(0).toUpperCase() + role.slice(1), checked: newRoles.includes(role), onChange: () => toggleRole(role) }, role))) }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => setRolesModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleUpdateRoles, loading: mutating, children: "Save Roles" })] })] }) })] }));
}
export default UserDetail;
//# sourceMappingURL=UserDetail.js.map