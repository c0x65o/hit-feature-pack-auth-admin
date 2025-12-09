'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StatsCard({ title, value, subtitle, icon: Icon, iconColor = 'text-[var(--hit-primary)]', trend, className = '', }) {
    return (_jsxs("div", { className: `bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg p-6 ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-[var(--hit-muted-foreground)] text-sm", children: title }), _jsx(Icon, { className: `${iconColor} w-5 h-5` })] }), _jsx("div", { className: "text-2xl font-bold text-[var(--hit-foreground)]", children: value }), (subtitle || trend) && (_jsxs("div", { className: "mt-1 flex items-center gap-2", children: [trend && (_jsxs("span", { className: `text-xs ${trend.direction === 'up'
                            ? 'text-[var(--hit-success)]'
                            : trend.direction === 'down'
                                ? 'text-[var(--hit-error)]'
                                : 'text-[var(--hit-muted-foreground)]'}`, children: [trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→', ' ', trend.value] })), subtitle && (_jsx("span", { className: "text-xs text-[var(--hit-muted-foreground)]", children: subtitle }))] }))] }));
}
//# sourceMappingURL=StatsCard.js.map