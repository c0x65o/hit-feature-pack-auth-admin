import React from 'react';
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
export declare function DataTable<T extends object>({ columns, data, loading, error, emptyMessage, searchable, searchPlaceholder, searchValue, onSearchChange, page, totalPages, onPageChange, sortBy, sortOrder, onSort, rowActions, onRowClick, }: DataTableProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DataTable.d.ts.map