'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Trash2, RefreshCw, Monitor, Smartphone, Globe } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { formatDateTime, formatRelativeTime } from '@hit/sdk';
import { useSessions, useSessionMutations } from '../hooks/useAuthAdmin';
export function Sessions({ onNavigate }) {
    const { Page, Card, Button, Badge, Table, Input, Alert, Spinner } = useUi();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const { data, loading, error, refresh } = useSessions({
        page,
        pageSize: 50,
        search,
    });
    const { revokeSession, loading: mutating } = useSessionMutations();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    const handleRevokeSession = async (sessionId) => {
        if (confirm('Are you sure you want to revoke this session?')) {
            try {
                await revokeSession(sessionId);
                refresh();
            }
            catch {
                // Error handled by hook
            }
        }
    };
    const getDeviceIcon = (userAgent) => {
        const ua = userAgent?.toLowerCase() || '';
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return _jsx(Smartphone, { size: 16, className: "text-gray-400" });
        }
        return _jsx(Monitor, { size: 16, className: "text-gray-400" });
    };
    const getDeviceName = (userAgent) => {
        if (!userAgent)
            return 'Unknown Device';
        if (userAgent.includes('Chrome'))
            return 'Chrome';
        if (userAgent.includes('Firefox'))
            return 'Firefox';
        if (userAgent.includes('Safari'))
            return 'Safari';
        if (userAgent.includes('Edge'))
            return 'Edge';
        return userAgent.split(' ')[0] || 'Unknown';
    };
    const isExpired = (expiresAt) => {
        return new Date(expiresAt) < new Date();
    };
    return (_jsxs(Page, { title: "Active Sessions", description: "Monitor and manage user sessions", actions: _jsxs(Button, { variant: "secondary", onClick: () => refresh(), children: [_jsx(RefreshCw, { size: 16, className: "mr-2" }), "Refresh"] }), children: [_jsx(Card, { children: _jsx("div", { className: "max-w-md", children: _jsx(Input, { label: "Search Sessions", value: search, onChange: setSearch, placeholder: "Search by email or IP..." }) }) }), error && (_jsx(Alert, { variant: "error", title: "Error loading sessions", children: error.message })), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : (_jsxs(_Fragment, { children: [_jsx(Table, { columns: [
                                {
                                    key: 'user_email',
                                    label: 'User',
                                    render: (value) => (_jsx("button", { className: "text-blue-500 hover:text-blue-400", onClick: () => navigate(`/admin/users/${encodeURIComponent(value)}`), children: value })),
                                },
                                {
                                    key: 'device',
                                    label: 'Device',
                                    render: (_, row) => (_jsxs("div", { className: "flex items-center gap-2", children: [getDeviceIcon(row.user_agent), _jsx("span", { children: getDeviceName(row.user_agent) })] })),
                                },
                                {
                                    key: 'ip_address',
                                    label: 'IP Address',
                                    render: (value) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Globe, { size: 16, className: "text-gray-400" }), _jsx("span", { className: "font-mono text-sm", children: value })] })),
                                },
                                {
                                    key: 'created_at',
                                    label: 'Started',
                                    render: (value) => formatDateTime(value),
                                },
                                {
                                    key: 'expires_at',
                                    label: 'Expires',
                                    render: (value) => {
                                        const expiresAt = value;
                                        if (!expiresAt)
                                            return '—';
                                        const expired = isExpired(expiresAt);
                                        return (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: expired ? 'text-gray-500 line-through' : '', children: formatDateTime(expiresAt) }), !expired && (_jsx("span", { className: "text-xs text-gray-400", children: formatRelativeTime(expiresAt) }))] }));
                                    },
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    render: (_, row) => {
                                        const current = row.current;
                                        const expired = isExpired(row.expires_at);
                                        return (_jsx(Badge, { variant: current ? 'success' : expired ? 'error' : 'default', children: current ? 'Current' : expired ? 'Expired' : 'Active' }));
                                    },
                                },
                                {
                                    key: 'actions',
                                    label: '',
                                    align: 'right',
                                    render: (_, row) => {
                                        if (row.current)
                                            return null;
                                        return (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRevokeSession(row.id), disabled: mutating, children: _jsx(Trash2, { size: 16, className: "text-red-500" }) }));
                                    },
                                },
                            ], data: (data?.items || []).map((session) => ({
                                id: session.id,
                                user_email: session.user_email,
                                user_agent: session.user_agent,
                                ip_address: session.ip_address,
                                created_at: session.created_at,
                                expires_at: session.expires_at,
                                current: session.current,
                            })), emptyMessage: "No active sessions" }), data && data.total_pages > 1 && (_jsxs("div", { className: "flex items-center justify-between pt-4 mt-4 border-t border-gray-800", children: [_jsxs("p", { className: "text-sm text-gray-400", children: ["Page ", data.page, " of ", data.total_pages] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "secondary", size: "md", disabled: page === 1, onClick: () => setPage(page - 1), children: "Previous" }), _jsx(Button, { variant: "secondary", size: "md", disabled: page >= data.total_pages, onClick: () => setPage(page + 1), children: "Next" })] })] }))] })) })] }));
}
export default Sessions;
//# sourceMappingURL=Sessions.js.map