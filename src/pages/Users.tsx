'use client';

import React, { useState } from 'react';
import { Eye, Key, Trash2, UserPlus, Lock, Unlock } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useUsers, useUserMutations, type User } from '../hooks/useAuthAdmin';

interface UsersProps {
  onNavigate?: (path: string) => void;
}

export function Users({ onNavigate }: UsersProps) {
  const { Page, Card, Button, Badge, Table, Modal, Input, Alert, Spinner } = useUi();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { createUser, deleteUser, resetPassword, lockUser, unlockUser, loading: mutating } = useUserMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
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

  return (
    <Page
      title="Users"
      description="Manage user accounts"
      actions={
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          <UserPlus size={16} className="mr-2" />
          Add User
        </Button>
      }
    >
      {/* Search */}
      <Card>
        <div className="max-w-md p-6">
          <Input
            label="Search Users"
            value={search}
            onChange={setSearch}
            placeholder="Search by email..."
          />
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="error" title="Error loading users">
          {error.message}
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <Table
              columns={[
                {
                  key: 'email',
                  label: 'Email',
                  render: (_, row) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{String(row.email)}</span>
                      {row.locked ? <Lock size={14} className="text-red-500" /> : null}
                    </div>
                  ),
                },
                {
                  key: 'email_verified',
                  label: 'Verified',
                  render: (value) => (
                    <Badge variant={value ? 'success' : 'warning'}>
                      {value ? 'Verified' : 'Pending'}
                    </Badge>
                  ),
                },
                {
                  key: 'two_factor_enabled',
                  label: '2FA',
                  render: (value) => (
                    <Badge variant={value ? 'success' : 'default'}>
                      {value ? 'Enabled' : 'Disabled'}
                    </Badge>
                  ),
                },
                {
                  key: 'roles',
                  label: 'Roles',
                  render: (value) => {
                    const roles = value as string[] | undefined;
                    return (
                      <div className="flex flex-wrap gap-1">
                        {roles?.map((role) => (
                          <Badge key={role} variant={role === 'admin' ? 'info' : 'default'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    );
                  },
                },
                {
                  key: 'created_at',
                  label: 'Created',
                  render: (value) => formatDate(value as string),
                },
                {
                  key: 'last_login',
                  label: 'Last Login',
                  render: (value) => formatDate(value as string),
                },
                {
                  key: 'actions',
                  label: '',
                  align: 'right' as const,
                  render: (_, row) => {
                    const user = row as unknown as User;
                    return (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${encodeURIComponent(user.email)}`)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user.email)}
                        >
                          <Key size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleLock(user)}
                        >
                          {user.locked ? <Unlock size={16} /> : <Lock size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    );
                  },
                },
              ]}
              data={(data?.items || []).map((user) => ({
                email: user.email,
                email_verified: user.email_verified,
                two_factor_enabled: user.two_factor_enabled,
                roles: user.roles,
                created_at: user.created_at,
                last_login: user.last_login,
                locked: user.locked,
              }))}
              onRowClick={(row) => navigate(`/admin/users/${encodeURIComponent(row.email as string)}`)}
              emptyMessage="No users found"
            />

            {/* Pagination */}
            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 mt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Page {data.page} of {data.total_pages} ({data.total} users)
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={page >= data.total_pages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New User"
        description="Add a new user to the system"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={newEmail}
            onChange={setNewEmail}
            placeholder="user@example.com"
            required
          />
          <Input
            label="Initial Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Minimum 8 characters"
            required
          />
          <p className="text-xs text-gray-400">
            User can change this after first login
          </p>
          <div className="flex justify-end gap-3 pt-4">
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
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        description="This action cannot be undone"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete{' '}
            <strong className="text-gray-100">{selectedUser?.email}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser} loading={mutating}>
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

export default Users;
