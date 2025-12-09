'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { RefreshCw, Download, Eye } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useAuditLog, useAuthAdminConfig } from '../hooks/useAuthAdmin';
export function AuditLog({ onNavigate }) {
    const { Page, Card, Button, Badge, Table, Modal, Input, Alert, Spinner } = useUi();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);
    const { data, loading, error, refresh } = useAuditLog({
        page,
        pageSize: 50,
        search,
    });
    const { config: adminConfig, loading: configLoading } = useAuthAdminConfig();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };
    // Redirect if audit log is disabled
    useEffect(() => {
        if (!configLoading && adminConfig && adminConfig.audit_log === false) {
            navigate('/admin');
        }
    }, [adminConfig, configLoading]);
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };
    const getEventBadgeVariant = (eventType) => {
        const type = eventType.toLowerCase();
        if (type.includes('success') || type.includes('created') || type.includes('enabled'))
            return 'success';
        if (type.includes('failed') || type.includes('error') || type.includes('deleted'))
            return 'error';
        if (type.includes('attempt') || type.includes('reset') || type.includes('disabled'))
            return 'warning';
        if (type.includes('updated') || type.includes('changed'))
            return 'info';
        return 'default';
    };
    const formatEventType = (eventType) => {
        return eventType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };
    const handleExport = () => {
        if (!data?.items)
            return;
        const headers = ['Time', 'User', 'Event', 'IP Address', 'User Agent'];
        const rows = data.items.map((entry) => [
            entry.created_at,
            entry.user_email,
            entry.event_type,
            entry.ip_address,
            entry.user_agent || '',
        ]);
        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    // Show loading while checking config
    if (configLoading) {
        return (_jsx(Page, { title: "Audit Log", description: "Security events and user activity", children: _jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }));
    }
    // Don't render if audit log is disabled (will redirect)
    if (!adminConfig?.audit_log) {
        return null;
    }
    return (_jsxs(Page, { title: "Audit Log", description: "Security events and user activity", actions: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "secondary", onClick: handleExport, disabled: !data?.items?.length, children: [_jsx(Download, { size: 16, className: "mr-2" }), "Export CSV"] }), _jsxs(Button, { variant: "secondary", onClick: () => refresh(), children: [_jsx(RefreshCw, { size: 16, className: "mr-2" }), "Refresh"] })] }), children: [_jsx(Card, { children: _jsx("div", { className: "max-w-md p-6", children: _jsx(Input, { label: "Search Audit Log", value: search, onChange: setSearch, placeholder: "Search by email, event, or IP..." }) }) }), error && (_jsx(Alert, { variant: "error", title: "Error loading audit log", children: error.message })), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : (_jsxs(_Fragment, { children: [_jsx(Table, { columns: [
                                {
                                    key: 'created_at',
                                    label: 'Time',
                                    render: (value) => _jsx("span", { className: "text-sm", children: formatDate(value) }),
                                },
                                {
                                    key: 'user_email',
                                    label: 'User',
                                    render: (value) => (_jsx("button", { className: "text-blue-500 hover:text-blue-400", onClick: () => navigate(`/admin/users/${encodeURIComponent(value)}`), children: value })),
                                },
                                {
                                    key: 'event_type',
                                    label: 'Event',
                                    render: (value) => (_jsx(Badge, { variant: getEventBadgeVariant(value), children: formatEventType(value) })),
                                },
                                {
                                    key: 'ip_address',
                                    label: 'IP Address',
                                    render: (value) => _jsx("span", { className: "font-mono text-sm", children: value }),
                                },
                                {
                                    key: 'actions',
                                    label: '',
                                    align: 'right',
                                    render: (_, row) => (_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedEntry(row), children: [_jsx(Eye, { size: 16, className: "mr-1" }), "Details"] })),
                                },
                            ], data: (data?.items || []).map((entry) => ({
                                id: entry.id,
                                created_at: entry.created_at,
                                user_email: entry.user_email,
                                event_type: entry.event_type,
                                ip_address: entry.ip_address,
                                user_agent: entry.user_agent,
                                details: entry.details,
                            })), emptyMessage: "No audit log entries found" }), data && data.total_pages > 1 && (_jsxs("div", { className: "flex items-center justify-between pt-4 mt-4 border-t border-gray-800", children: [_jsxs("p", { className: "text-sm text-gray-400", children: ["Page ", data.page, " of ", data.total_pages] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", size: "sm", disabled: page === 1, onClick: () => setPage(page - 1), children: "Previous" }), _jsx(Button, { variant: "secondary", size: "sm", disabled: page >= data.total_pages, onClick: () => setPage(page + 1), children: "Next" })] })] }))] })) }), _jsx(Modal, { open: !!selectedEntry, onClose: () => setSelectedEntry(null), title: "Audit Log Entry", size: "lg", children: selectedEntry && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400", children: "Time" }), _jsx("p", { className: "text-gray-100", children: formatDate(selectedEntry.created_at) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400", children: "User" }), _jsx("p", { className: "text-gray-100", children: selectedEntry.user_email })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400", children: "Event" }), _jsx(Badge, { variant: getEventBadgeVariant(selectedEntry.event_type), children: formatEventType(selectedEntry.event_type) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400", children: "IP Address" }), _jsx("p", { className: "font-mono text-gray-100", children: selectedEntry.ip_address })] })] }), selectedEntry.user_agent && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "User Agent" }), _jsx("p", { className: "text-sm text-gray-400 break-all", children: selectedEntry.user_agent })] })), selectedEntry.details && Object.keys(selectedEntry.details).length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-400 mb-1", children: "Additional Details" }), _jsx("pre", { className: "bg-gray-800 rounded-lg p-3 text-sm overflow-auto", children: JSON.stringify(selectedEntry.details, null, 2) })] })), _jsx("div", { className: "flex justify-end gap-3 pt-4", children: _jsx(Button, { variant: "ghost", onClick: () => setSelectedEntry(null), children: "Close" }) })] })) })] }));
}
export default AuditLog;
//# sourceMappingURL=AuditLog.js.map