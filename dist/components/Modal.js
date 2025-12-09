'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
export function Modal({ isOpen, onClose, title, children, footer, size = 'md', }) {
    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape')
            onClose();
    }, [onClose]);
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-[var(--hit-modal-backdrop)] transition-opacity", onClick: onClose }), _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsxs("div", { className: `relative w-full ${sizeClasses[size]} bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg shadow-xl`, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-[var(--hit-border)]", children: [_jsx("h3", { className: "text-lg font-semibold text-[var(--hit-foreground)]", children: title }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-[var(--hit-surface-hover)] transition-colors", children: _jsx(X, { className: "w-5 h-5 text-[var(--hit-muted-foreground)]" }) })] }), _jsx("div", { className: "p-4", children: children }), footer && (_jsx("div", { className: "flex items-center justify-end gap-2 p-4 border-t border-[var(--hit-border)]", children: footer }))] }) })] }));
}
//# sourceMappingURL=Modal.js.map