import React from 'react';
import { LucideIcon } from 'lucide-react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    children?: React.ReactNode;
}
export declare function Button({ variant, size, icon: Icon, iconPosition, loading, children, className, disabled, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Button.d.ts.map