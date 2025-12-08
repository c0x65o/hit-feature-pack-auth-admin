'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = 'No data found',
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  page = 1,
  totalPages = 1,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  rowActions,
  onRowClick,
}: DataTableProps<T>) {
  const getValue = (row: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return value;
  };

  return (
    <div className="bg-[var(--hit-surface)] border border-[var(--hit-border)] rounded-lg overflow-hidden">
      {/* Search bar */}
      {searchable && onSearchChange && (
        <div className="p-4 border-b border-[var(--hit-border)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--hit-muted-foreground)]" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full max-w-md pl-10 pr-4 py-2 border border-[var(--hit-border)] rounded-lg bg-[var(--hit-input-bg)] text-[var(--hit-foreground)] placeholder-[var(--hit-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)]"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--hit-muted)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && onSort?.(String(col.key))}
                  className={`px-4 py-3 text-left text-xs font-medium text-[var(--hit-muted-foreground)] uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:bg-[var(--hit-surface-hover)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-[var(--hit-muted-foreground)] uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hit-border)]">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--hit-muted-foreground)]" />
                  <p className="mt-2 text-[var(--hit-muted-foreground)]">Loading...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-[var(--hit-error)]"
                >
                  {error.message}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-[var(--hit-muted-foreground)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`${
                    onRowClick
                      ? 'cursor-pointer hover:bg-[var(--hit-surface-hover)]'
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-sm text-[var(--hit-foreground)]"
                    >
                      {col.render ? col.render(row) : String(getValue(row, String(col.key)) ?? '')}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="px-4 py-3 border-t border-[var(--hit-border)] flex items-center justify-between">
          <span className="text-sm text-[var(--hit-muted-foreground)]">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-[var(--hit-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-[var(--hit-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
