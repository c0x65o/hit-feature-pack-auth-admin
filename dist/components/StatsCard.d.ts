import { LucideIcon } from 'lucide-react';
interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    iconColor?: string;
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    className?: string;
}
export declare function StatsCard({ title, value, subtitle, icon: Icon, iconColor, trend, className, }: StatsCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StatsCard.d.ts.map