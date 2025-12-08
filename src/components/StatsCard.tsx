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
  iconColor = 'text-blue-500',
  trend,
  className = '',
}: StatsCardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{title}</span>
        <Icon className={`${iconColor} w-5 h-5`} />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs ${
                trend.direction === 'up'
                  ? 'text-green-500'
                  : trend.direction === 'down'
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}{' '}
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
