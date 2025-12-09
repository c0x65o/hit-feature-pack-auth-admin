'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function Badge({ children, variant = 'default', size = 'sm', className = '', }) {
    const variants = {
        default: 'bg-[var(--hit-muted)] text-[var(--hit-muted-foreground)]',
        success: 'bg-[var(--hit-success-light)] text-[var(--hit-success-dark)]',
        warning: 'bg-[var(--hit-warning-light)] text-[var(--hit-warning-dark)]',
        error: 'bg-[var(--hit-error-light)] text-[var(--hit-error-dark)]',
        info: 'bg-[var(--hit-info-light)] text-[var(--hit-info-dark)]',
    };
    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };
    return (_jsx("span", { className: `inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`, children: children }));
}
//# sourceMappingURL=Badge.js.map