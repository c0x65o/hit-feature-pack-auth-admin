'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { UserCheck } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useUsers, useRolePagePermissions, useUserPageOverrides, useUsersWithOverrides, usePagePermissionsMutations, } from '../hooks/useAuthAdmin';
// Helper to extract all pages from navigation items
// Excludes admin pages and auth pages
function getAllPages() {
    if (typeof window === 'undefined')
        return [];
    try {
        // Try to get navigation items from the generated nav file
        // This is a dynamic import that may fail if nav hasn't been generated
        const nav = require('@/.hit/generated/nav');
        const navItems = nav.featurePackNav || [];
        const pages = [];
        // Recursively extract pages from nav items
        function extractPages(items, parentPath = '') {
            for (const item of items) {
                // Skip admin pages and auth pages
                if (item.path?.startsWith('/admin') || item.path?.startsWith('/auth') || item.path?.startsWith('/login')) {
                    continue;
                }
                // Skip items that require admin role
                if (item.roles && item.roles.includes('admin')) {
                    continue;
                }
                // Add page if it has a path
                if (item.path && item.path !== '/') {
                    pages.push({
                        path: item.path,
                        label: item.label || item.path,
                    });
                }
                // Recursively process children
                if (item.children && Array.isArray(item.children)) {
                    extractPages(item.children, item.path || '');
                }
            }
        }
        extractPages(navItems);
        // Also try to get custom nav items
        try {
            const customNav = require('@/lib/custom-nav');
            if (customNav.customNavItems) {
                extractPages(customNav.customNavItems);
            }
        }
        catch {
            // Custom nav not available
        }
        // Remove duplicates
        const uniquePages = Array.from(new Map(pages.map((p) => [p.path, p])).values());
        return uniquePages.sort((a, b) => a.path.localeCompare(b.path));
    }
    catch (error) {
        console.warn('Could not load navigation items:', error);
        return [];
    }
}
export function Permissions({ onNavigate }) {
    const { Page, Card, Button, Badge, DataTable, Modal, Input, Alert, Spinner, Tabs, Checkbox } = useUi();
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [activeTab, setActiveTab] = useState('roles');
    const [userOverrideModalOpen, setUserOverrideModalOpen] = useState(false);
    const [selectedUserForOverride, setSelectedUserForOverride] = useState(null);
    const { data: usersData, loading: usersLoading } = useUsers({ pageSize: 1000 });
    const { data: rolePermissions, loading: rolePermissionsLoading, refresh: refreshRolePermissions } = useRolePagePermissions(selectedRole);
    const { data: userOverrides, loading: userOverridesLoading, refresh: refreshUserOverrides } = useUserPageOverrides(selectedUser);
    const { data: usersWithOverrides, loading: usersWithOverridesLoading, refresh: refreshUsersWithOverrides } = useUsersWithOverrides();
    const { setRolePagePermission, deleteRolePagePermission, setUserPageOverride, deleteUserPageOverride, loading: mutating, } = usePagePermissionsMutations();
    // Get all unique roles from users
    const roles = useMemo(() => {
        if (!usersData?.items)
            return [];
        const roleSet = new Set();
        usersData.items.forEach((user) => {
            const role = user.role || 'user';
            roleSet.add(role);
        });
        return Array.from(roleSet).sort();
    }, [usersData]);
    // Get all pages from navigation (excluding admin pages)
    // For now, we'll use a placeholder - in production this would come from navigation items
    const allPages = useMemo(() => {
        // This should fetch from navigation items, excluding admin pages
        // For now, return empty array - will be populated by user interaction
        return getAllPages();
    }, []);
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleRolePermissionToggle = async (pagePath, enabled) => {
        if (!selectedRole)
            return;
        try {
            if (enabled) {
                await setRolePagePermission(selectedRole, pagePath, true);
            }
            else {
                // If disabling, create a permission with enabled=false
                await setRolePagePermission(selectedRole, pagePath, false);
            }
            refreshRolePermissions();
        }
        catch (error) {
            console.error('Failed to update role permission:', error);
        }
    };
    const handleUserOverrideToggle = async (email, pagePath, enabled) => {
        try {
            if (enabled) {
                await setUserPageOverride(email, pagePath, true);
            }
            else {
                await setUserPageOverride(email, pagePath, false);
            }
            refreshUsersWithOverrides();
        }
        catch (error) {
            console.error('Failed to update user override:', error);
        }
    };
    // Create a map of page paths to enabled status for the selected role
    const rolePermissionMap = useMemo(() => {
        const map = new Map();
        if (rolePermissions) {
            rolePermissions.forEach((perm) => {
                map.set(perm.page_path, perm.enabled);
            });
        }
        return map;
    }, [rolePermissions]);
    return (_jsxs(Page, { title: "Permissions", description: "Manage page access permissions for roles and users", children: [_jsx(Tabs, { activeTab: activeTab, onChange: (tabId) => setActiveTab(tabId), tabs: [
                    {
                        id: 'roles',
                        label: 'Role Permissions',
                        content: (_jsx("div", { className: "space-y-4 mt-4", children: _jsx(Card, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Select Role" }), _jsx("div", { className: "flex gap-2", children: roles.map((role) => (_jsx(Button, { variant: selectedRole === role ? 'primary' : 'ghost', onClick: () => setSelectedRole(role), children: role }, role))) })] }), selectedRole && (_jsxs("div", { className: "mt-4", children: [_jsxs("h3", { className: "text-lg font-semibold mb-2", children: ["Page Permissions for Role: ", _jsx(Badge, { children: selectedRole })] }), _jsx("div", { className: "mb-4", children: _jsx(Alert, { variant: "info", children: "All pages are enabled by default. Toggle off to restrict access for this role." }) }), rolePermissionsLoading ? (_jsx(Spinner, {})) : (_jsx("div", { className: "space-y-2", children: allPages.length === 0 ? (_jsx(Alert, { variant: "warning", children: "No pages found. Pages are discovered from navigation items. Add pages to your feature packs or custom navigation to manage their permissions." })) : (allPages.map((page) => {
                                                        const isEnabled = rolePermissionMap.get(page.path) ?? true; // Default to enabled
                                                        return (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: page.label || page.path }), _jsx("div", { className: "text-sm text-gray-500", children: page.path })] }), _jsx(Checkbox, { checked: isEnabled, onChange: (checked) => handleRolePermissionToggle(page.path, checked), disabled: mutating })] }, page.path));
                                                    })) }))] })), !selectedRole && (_jsx(Alert, { variant: "info", children: "Select a role above to manage its page permissions." }))] }) }) })),
                    },
                    {
                        id: 'users',
                        label: 'User Overrides',
                        content: (_jsxs("div", { className: "space-y-4 mt-4", children: [_jsx(Card, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Users with Overrides" }), _jsxs(Button, { variant: "primary", onClick: () => {
                                                            setUserOverrideModalOpen(true);
                                                        }, children: [_jsx(UserCheck, { size: 16, className: "mr-2" }), "Add User Override"] })] }), usersWithOverridesLoading ? (_jsx(Spinner, {})) : (_jsx(DataTable, { columns: [
                                                    {
                                                        key: 'email',
                                                        label: 'Email',
                                                        render: (value) => (_jsx("button", { onClick: () => {
                                                                setSelectedUser(value);
                                                                const user = usersData?.items.find((u) => u.email === value);
                                                                if (user) {
                                                                    setSelectedUserForOverride(user);
                                                                }
                                                            }, className: "text-blue-600 hover:underline", children: value })),
                                                    },
                                                    {
                                                        key: 'role',
                                                        label: 'Role',
                                                        render: (value) => _jsx(Badge, { variant: "default", children: value }),
                                                    },
                                                    {
                                                        key: 'override_count',
                                                        label: 'Overrides',
                                                        render: (value) => (_jsx(Badge, { variant: "info", children: value > 0 ? `${value} override${value > 1 ? 's' : ''}` : 'None' })),
                                                    },
                                                ], data: usersWithOverrides || [], emptyMessage: "No users with overrides" }))] }) }), selectedUser && selectedUserForOverride && (_jsx(Card, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Page Overrides for: ", _jsx(Badge, { children: selectedUserForOverride.email }), _jsxs("span", { className: "ml-2 text-sm text-gray-500", children: ["(Role: ", selectedUserForOverride.role || 'user', ")"] })] }), _jsx(Button, { variant: "ghost", onClick: () => {
                                                            setSelectedUser('');
                                                            setSelectedUserForOverride(null);
                                                        }, children: "Close" })] }), _jsx("div", { className: "mb-4", children: _jsx(Alert, { variant: "info", children: "User overrides take precedence over role permissions. Configure specific page access for this user." }) }), userOverridesLoading ? (_jsx(Spinner, {})) : (_jsx("div", { className: "space-y-2", children: allPages.length === 0 ? (_jsx(Alert, { variant: "warning", children: "No pages found. Pages are discovered from navigation items." })) : (allPages.map((page) => {
                                                    const override = userOverrides?.find((o) => o.page_path === page.path);
                                                    const isEnabled = override ? override.enabled : undefined; // undefined means use role default
                                                    return (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: page.label || page.path }), _jsx("div", { className: "text-sm text-gray-500", children: page.path }), isEnabled === undefined && (_jsx("div", { className: "text-xs text-gray-400 mt-1", children: "Using role default" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: isEnabled ?? true, onChange: (checked) => handleUserOverrideToggle(selectedUser, page.path, checked), disabled: mutating }), isEnabled !== undefined && (_jsx(Button, { variant: "ghost", size: "sm", onClick: async () => {
                                                                            try {
                                                                                await deleteUserPageOverride(selectedUser, page.path);
                                                                                refreshUserOverrides();
                                                                                refreshUsersWithOverrides();
                                                                            }
                                                                            catch (error) {
                                                                                console.error('Failed to delete override:', error);
                                                                            }
                                                                        }, children: "Reset" }))] })] }, page.path));
                                                })) }))] }) }))] })),
                    },
                ] }), _jsx(Modal, { open: userOverrideModalOpen, onClose: () => setUserOverrideModalOpen(false), title: "Add User Override", description: "Select a user to add page-specific overrides", children: _jsx("div", { className: "space-y-4", children: usersLoading ? (_jsx(Spinner, {})) : (_jsx(DataTable, { columns: [
                            {
                                key: 'email',
                                label: 'Email',
                                render: (value) => value,
                            },
                            {
                                key: 'role',
                                label: 'Role',
                                render: (value) => _jsx(Badge, { variant: "default", children: value }),
                            },
                        ], data: (usersData?.items || []).map((user) => ({
                            email: user.email,
                            role: user.role || 'user',
                        })), onRowClick: (row) => {
                            const user = usersData?.items.find((u) => u.email === row.email);
                            if (user) {
                                setSelectedUserForOverride(user);
                                setSelectedUser(user.email);
                                setUserOverrideModalOpen(false);
                                setActiveTab('users');
                            }
                        }, emptyMessage: "No users found" })) }) })] }));
}
export default Permissions;
//# sourceMappingURL=Permissions.js.map