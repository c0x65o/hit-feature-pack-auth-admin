'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { ArrowLeft, Shield, Key, Lock, Unlock, Trash2, Monitor, Globe, Mail, CheckCircle, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { formatDateTime } from '@hit/sdk';
import { useUser, useSessions, useUserMutations, useSessionMutations, useAuthAdminConfig, } from '../hooks/useAuthAdmin';
export function UserDetail({ email, onNavigate }) {
    const { Page, Card, Button, Badge, Table, Modal, Alert, Spinner, EmptyState, Select } = useUi();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [rolesModalOpen, setRolesModalOpen] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [availableRoles, setAvailableRoles] = useState(['admin', 'user']);
    const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [resetPasswordMethod, setResetPasswordMethod] = useState('email');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(null);
    const [resetPasswordError, setResetPasswordError] = useState(null);
    const { user, loading, error, refresh } = useUser(email);
    const { config: authConfig } = useAuthAdminConfig();
    // Fetch available roles from features endpoint
    React.useEffect(() => {
        const fetchAvailableRoles = async () => {
            try {
                const response = await fetch('/features');
                const data = await response.json();
                const roles = data.features?.available_roles || ['admin', 'user'];
                setAvailableRoles(roles);
            }
            catch (e) {
                // Fallback to default roles
                setAvailableRoles(['admin', 'user']);
            }
        };
        fetchAvailableRoles();
    }, []);
    const { data: sessionsData, refresh: refreshSessions } = useSessions({ search: email });
    const { deleteUser, resetPassword, resendVerification, verifyEmail, updateRoles, lockUser, unlockUser, loading: mutating, } = useUserMutations();
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
        setResetPasswordModalOpen(true);
        setResetPasswordSuccess(null);
        setResetPasswordError(null);
    };
    const handleResetPasswordSubmit = async () => {
        setResetPasswordSuccess(null);
        setResetPasswordError(null);
        if (resetPasswordMethod === 'email') {
            try {
                await resetPassword(email, true);
                setResetPasswordSuccess('Password reset email sent successfully!');
                setTimeout(() => {
                    setResetPasswordModalOpen(false);
                    setResetPasswordMethod('email');
                    setNewPassword('');
                    setConfirmPassword('');
                    setResetPasswordSuccess(null);
                }, 2000);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email';
                setResetPasswordError(errorMessage);
            }
        }
        else {
            // Direct password set
            if (!newPassword) {
                setResetPasswordError('Password is required');
                return;
            }
            if (newPassword !== confirmPassword) {
                setResetPasswordError('Passwords do not match');
                return;
            }
            try {
                await resetPassword(email, false, newPassword);
                setResetPasswordSuccess('Password has been reset successfully!');
                setTimeout(() => {
                    setResetPasswordModalOpen(false);
                    setResetPasswordMethod('email');
                    setNewPassword('');
                    setConfirmPassword('');
                    setResetPasswordSuccess(null);
                    refresh();
                }, 2000);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
                setResetPasswordError(errorMessage);
            }
        }
    };
    const handleResendVerification = async () => {
        if (confirm(`Resend verification email to ${email}?`)) {
            try {
                await resendVerification(email);
                alert('Verification email sent!');
            }
            catch {
                // Error handled by hook
            }
        }
    };
    const handleVerifyEmail = async () => {
        if (confirm(`Mark email as verified for ${email}?`)) {
            try {
                await verifyEmail(email);
                refresh();
                alert('Email verified successfully!');
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
        if (!newRole) {
            alert('Please select a role');
            return;
        }
        try {
            await updateRoles(email, newRole);
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
    const formatDateOrNever = (dateStr) => {
        if (!dateStr)
            return 'Never';
        return formatDateTime(dateStr);
    };
    const openRolesModal = () => {
        // Support both new single role and legacy roles array
        const currentRole = user?.role || (user?.roles && user.roles.length > 0 ? user.roles[0] : 'user') || 'user';
        setNewRole(currentRole);
        setRolesModalOpen(true);
    };
    if (loading) {
        return (_jsx(Page, { title: "Loading...", children: _jsx(Card, { children: _jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }) }));
    }
    if (error || !user) {
        return (_jsx(Page, { title: "User Not Found", actions: _jsxs(Button, { variant: "secondary", onClick: () => navigate('/admin/users'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to Users"] }), children: _jsx(Alert, { variant: "error", title: "Error", children: error?.message || 'User not found' }) }));
    }
    return (_jsxs(Page, { title: user.email, description: user.locked ? 'This account is locked' : undefined, actions: _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { variant: "secondary", onClick: () => navigate('/admin/users'), children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back"] }), !user.email_verified && (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "secondary", onClick: handleVerifyEmail, disabled: mutating, children: [_jsx(CheckCircle, { size: 16, className: "mr-2" }), "Verify"] }), _jsxs(Button, { variant: "secondary", onClick: handleResendVerification, disabled: mutating, children: [_jsx(Mail, { size: 16, className: "mr-2" }), "Resend Verification"] })] })), _jsxs(Button, { variant: "secondary", onClick: handleResetPassword, disabled: mutating, children: [_jsx(Key, { size: 16, className: "mr-2" }), "Reset Password"] }), _jsxs(Button, { variant: "secondary", onClick: handleToggleLock, disabled: mutating, children: [user.locked ? _jsx(Unlock, { size: 16, className: "mr-2" }) : _jsx(Lock, { size: 16, className: "mr-2" }), user.locked ? 'Unlock' : 'Lock'] }), _jsxs(Button, { variant: "danger", onClick: () => setDeleteModalOpen(true), children: [_jsx(Trash2, { size: 16, className: "mr-2" }), "Delete"] })] }), children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "Account Details", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Email" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: user.email })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Verified" }), _jsx(Badge, { variant: user.email_verified ? 'success' : 'warning', children: user.email_verified ? 'Yes' : 'No' })] }), authConfig?.two_factor_auth !== false && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "2FA" }), _jsx(Badge, { variant: user.two_factor_enabled ? 'success' : 'default', children: user.two_factor_enabled ? 'Enabled' : 'Disabled' })] })), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Status" }), _jsx(Badge, { variant: user.locked ? 'error' : 'success', children: user.locked ? 'Locked' : 'Active' })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Created" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: formatDateOrNever(user.created_at) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Last Login" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: formatDateOrNever(user.last_login ?? null) })] })] }) }), _jsx(Card, { title: "Role", footer: _jsxs(Button, { variant: "secondary", size: "sm", onClick: openRolesModal, children: [_jsx(Shield, { size: 16, className: "mr-2" }), "Edit Role"] }), children: _jsx("div", { className: "flex flex-wrap gap-2", children: (() => {
                                // Support both new single role and legacy roles array
                                const userRole = user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'user') || 'user';
                                return (_jsx(Badge, { variant: userRole === 'admin' ? 'info' : 'default', children: userRole }, userRole));
                            })() }) })] }), _jsx(Card, { title: "Active Sessions", footer: sessionsData?.items?.length ? (_jsx(Button, { variant: "danger", size: "sm", onClick: handleRevokeAllSessions, children: "Revoke All Sessions" })) : undefined, children: !sessionsData?.items?.length ? (_jsx(EmptyState, { icon: _jsx(Monitor, { size: 48 }), title: "No active sessions", description: "This user has no active sessions" })) : (_jsx(Table, { columns: [
                        {
                            key: 'ip_address',
                            label: 'IP Address',
                            render: (value) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Globe, { size: 16, className: "text-gray-400" }), _jsx("span", { className: "font-mono text-sm", children: value })] })),
                        },
                        {
                            key: 'created_at',
                            label: 'Started',
                            render: (value) => formatDateOrNever(value),
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
                    })) })) }), _jsx(Modal, { open: deleteModalOpen, onClose: () => setDeleteModalOpen(false), title: "Delete User", description: "This action cannot be undone", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-300", children: ["Are you sure you want to delete ", _jsx("strong", { className: "text-gray-900 dark:text-gray-100", children: user.email }), "?"] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => setDeleteModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleDeleteUser, loading: mutating, children: "Delete User" })] })] }) }), _jsx(Modal, { open: rolesModalOpen, onClose: () => setRolesModalOpen(false), title: "Edit Role", description: "Select the role for this user", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Select, { label: "Role", value: newRole, onChange: (value) => setNewRole(value), options: availableRoles.map((role) => ({
                                value: role,
                                label: role.charAt(0).toUpperCase() + role.slice(1),
                            })), placeholder: "Select a role" }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => setRolesModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleUpdateRoles, loading: mutating, children: "Save Role" })] })] }) }), _jsx(Modal, { open: resetPasswordModalOpen, onClose: () => {
                    setResetPasswordModalOpen(false);
                    setResetPasswordMethod('email');
                    setNewPassword('');
                    setConfirmPassword('');
                    setResetPasswordSuccess(null);
                    setResetPasswordError(null);
                }, title: "Reset Password", description: "Choose how to reset the password for this user", children: _jsxs("div", { className: "space-y-4", children: [resetPasswordSuccess && (_jsx(Alert, { variant: "success", title: "Success", children: resetPasswordSuccess })), resetPasswordError && (_jsx(Alert, { variant: "error", title: "Error", children: resetPasswordError })), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "radio", id: "reset-email", checked: resetPasswordMethod === 'email', onChange: () => setResetPasswordMethod('email'), className: "w-4 h-4" }), _jsxs("label", { htmlFor: "reset-email", className: "cursor-pointer", children: [_jsx("div", { className: "font-medium", children: "Send reset email" }), _jsx("div", { className: "text-sm text-gray-400", children: "Send a password reset link via email through the email provider module" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "radio", id: "reset-direct", checked: resetPasswordMethod === 'direct', onChange: () => setResetPasswordMethod('direct'), className: "w-4 h-4" }), _jsxs("label", { htmlFor: "reset-direct", className: "cursor-pointer", children: [_jsx("div", { className: "font-medium", children: "Set password directly" }), _jsx("div", { className: "text-sm text-gray-400", children: "Type in a new password to change it immediately" })] })] })] }), resetPasswordMethod === 'direct' && (_jsxs("div", { className: "space-y-3 pt-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "New Password" }), _jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Enter new password" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Confirm Password" }), _jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), className: "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500", placeholder: "Confirm new password" })] })] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { variant: "ghost", onClick: () => {
                                        setResetPasswordModalOpen(false);
                                        setResetPasswordMethod('email');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setResetPasswordSuccess(null);
                                        setResetPasswordError(null);
                                    }, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleResetPasswordSubmit, loading: mutating, children: resetPasswordMethod === 'email' ? 'Send Reset Email' : 'Set Password' })] })] }) })] }));
}
export default UserDetail;
//# sourceMappingURL=UserDetail.js.map