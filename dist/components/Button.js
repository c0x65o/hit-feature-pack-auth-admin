'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
export function Button({ variant = 'primary', size = 'md', icon: Icon, iconPosition = 'left', loading = false, children, className = '', disabled, ...props }) {
    const variants = {
        primary: 'bg-[var(--hit-primary)] text-white hover:bg-[var(--hit-primary-hover)] focus:ring-[var(--hit-primary)]',
        secondary: 'bg-[var(--hit-secondary)] text-white hover:bg-[var(--hit-secondary-hover)] focus:ring-[var(--hit-secondary)]',
        outline: 'border border-[var(--hit-border)] text-[var(--hit-foreground)] hover:bg-[var(--hit-surface-hover)] focus:ring-[var(--hit-primary)]',
        ghost: 'text-[var(--hit-foreground)] hover:bg-[var(--hit-surface-hover)] focus:ring-[var(--hit-primary)]',
        danger: 'bg-[var(--hit-error)] text-white hover:bg-[var(--hit-error-dark)] focus:ring-[var(--hit-error)]',
    };
    const sizes = {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };
    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };
    return (_jsxs("button", { className: `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`, disabled: disabled || loading, ...props, children: [loading && _jsx(Loader2, { className: `${iconSizes[size]} animate-spin` }), !loading && Icon && iconPosition === 'left' && (_jsx(Icon, { className: iconSizes[size] })), children, !loading && Icon && iconPosition === 'right' && (_jsx(Icon, { className: iconSizes[size] }))] }));
}
//# sourceMappingURL=Button.js.map