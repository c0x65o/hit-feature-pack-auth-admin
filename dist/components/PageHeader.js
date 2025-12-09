'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageHeader({ title, description, actions }) {
    return (_jsxs("div", { className: "mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-[var(--hit-foreground)]", children: title }), description && (_jsx("p", { className: "mt-1 text-sm text-[var(--hit-muted-foreground)]", children: description }))] }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] }));
}
//# sourceMappingURL=PageHeader.js.map