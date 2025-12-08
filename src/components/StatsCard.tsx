'use client';

import React from 'react';
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

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[var(--hit-primary)]',
  trend,
  className = '',
}: StatsCardProps) {
  return (
    <div
      className={`bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[var(--hit-muted-foreground)] text-sm">{title}</span>
        <Icon className={`${iconColor} w-5 h-5`} />
      </div>
      <div className="text-2xl font-bold text-[var(--hit-foreground)]">{value}</div>
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs ${
                trend.direction === 'up'
                  ? 'text-[var(--hit-success)]'
                  : trend.direction === 'down'
                  ? 'text-[var(--hit-error)]'
                  : 'text-[var(--hit-muted-foreground)]'
              }`}
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-[var(--hit-muted-foreground)]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
