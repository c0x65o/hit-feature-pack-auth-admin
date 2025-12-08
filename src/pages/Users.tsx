'use client';

import React, { useState } from 'react';
import { Eye, Key, Trash2, UserPlus, Shield, ShieldOff, Lock, Unlock } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useUsers, useUserMutations, type User } from '../hooks/useAuthAdmin';

interface UsersProps {
  onNavigate?: (path: string) => void;
}

export function Users({ onNavigate }: UsersProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { data, loading, error, refresh } = useUsers({
    page,
    pageSize: 25,
    search,
    sortBy,
    sortOrder,
  });

  const { createUser, deleteUser, resetPassword, lockUser, unlockUser, loading: mutating } = useUserMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser({ email: newEmail, password: newPassword });
      setCreateModalOpen(false);
      setNewEmail('');
      setNewPassword('');
      refresh();
    } catch {
      // Error handled by hook
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.email);
      setDeleteModalOpen(false);
      setSelectedUser(null);
      refresh();
    } catch {
      // Error handled by hook
    }
  };

  const handleResetPassword = async (email: string) => {
    if (confirm(`Send password reset email to ${email}?`)) {
      try {
        await resetPassword(email);
        alert('Password reset email sent!');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleToggleLock = async (user: User) => {
    const action = user.locked ? unlockUser : lockUser;
    const actionName = user.locked ? 'unlock' : 'lock';
    if (confirm(`Are you sure you want to ${actionName} ${user.email}?`)) {
      try {
        await action(user.email);
        refresh();
      } catch {
        // Error handled by hook
      }
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString();
  };

  const columns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.email}</span>
          {user.locked && (
            <Lock className="w-3 h-3 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'email_verified',
      label: 'Verified',
      render: (user: User) => (
        <Badge variant={user.email_verified ? 'success' : 'warning'}>
          {user.email_verified ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'two_factor_enabled',
      label: '2FA',
      render: (user: User) => (
        <Badge variant={user.two_factor_enabled ? 'success' : 'default'}>
          {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (user: User) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role) => (
            <Badge key={role} variant={role === 'admin' ? 'info' : 'default'}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (user: User) => formatDate(user.created_at),
    },
    {
      key: 'last_login',
      label: 'Last Login',
      sortable: true,
      render: (user: User) => formatDate(user.last_login),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts"
        actions={
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setCreateModalOpen(true)}
          >
            Add User
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={loading}
        error={error}
        searchable
        searchPlaceholder="Search users..."
        searchValue={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={(user) => navigate(`/admin/users/${encodeURIComponent(user.email)}`)}
        rowActions={(user) => (
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={Eye}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/users/${encodeURIComponent(user.email)}`);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Key}
              onClick={(e) => {
                e.stopPropagation();
                handleResetPassword(user.email);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={user.locked ? Unlock : Lock}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLock(user);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              className="text-red-500 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(user);
                setDeleteModalOpen(true);
              }}
            />
          </>
        )}
        emptyMessage="No users found"
      />

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateUser}
              loading={mutating}
              disabled={!newEmail || !newPassword}
            >
              Create User
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Initial Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 8 characters"
            />
            <p className="mt-1 text-xs text-gray-500">
              User can change this after first login
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              loading={mutating}
            >
              Delete User
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete{' '}
          <strong className="text-gray-900 dark:text-gray-100">
            {selectedUser?.email}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default Users;
