'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  Key,
  Lock,
  Unlock,
  Trash2,
  RefreshCw,
  Monitor,
  Globe,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import {
  useUser,
  useSessions,
  useUserMutations,
  useSessionMutations,
} from '../hooks/useAuthAdmin';

interface UserDetailProps {
  email: string;
  onNavigate?: (path: string) => void;
}

export function UserDetail({ email, onNavigate }: UserDetailProps) {
  const { Page, Card, Button, Badge, Table, Modal, Alert, Spinner, EmptyState, Checkbox } = useUi();
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [newRoles, setNewRoles] = useState<string[]>([]);

  const { user, loading, error, refresh } = useUser(email);
  const { data: sessionsData, refresh: refreshSessions } = useSessions({ search: email });
  const {
    deleteUser,
    resetPassword,
    updateRoles,
    lockUser,
    unlockUser,
    loading: mutating,
  } = useUserMutations();
  const { revokeSession, revokeAllUserSessions } = useSessionMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(email);
      navigate('/admin/users');
    } catch {
      // Error handled by hook
    }
  };

  const handleResetPassword = async () => {
    if (confirm(`Send password reset email to ${email}?`)) {
      try {
        await resetPassword(email);
        alert('Password reset email sent!');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleToggleLock = async () => {
    const action = user?.locked ? unlockUser : lockUser;
    const actionName = user?.locked ? 'unlock' : 'lock';
    if (confirm(`Are you sure you want to ${actionName} this user?`)) {
      try {
        await action(email);
        refresh();
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleUpdateRoles = async () => {
    try {
      await updateRoles(email, newRoles);
      setRolesModalOpen(false);
      refresh();
    } catch {
      // Error handled by hook
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Revoke this session?')) {
      try {
        await revokeSession(sessionId);
        refreshSessions();
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleRevokeAllSessions = async () => {
    if (confirm('Revoke all sessions for this user?')) {
      try {
        await revokeAllUserSessions(email);
        refreshSessions();
      } catch {
        // Error handled by hook
      }
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  const openRolesModal = () => {
    setNewRoles(user?.roles || []);
    setRolesModalOpen(true);
  };

  const toggleRole = (role: string) => {
    setNewRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  if (loading) {
    return (
      <Page title="Loading...">
        <Card>
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      </Page>
    );
  }

  if (error || !user) {
    return (
      <Page
        title="User Not Found"
        actions={
          <Button variant="secondary" onClick={() => navigate('/admin/users')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Users
          </Button>
        }
      >
        <Alert variant="error" title="Error">
          {error?.message || 'User not found'}
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title={user.email}
      description={user.locked ? 'This account is locked' : undefined}
      actions={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/users')}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <Button variant="secondary" onClick={handleResetPassword} disabled={mutating}>
            <Key size={16} className="mr-2" />
            Reset Password
          </Button>
          <Button variant="secondary" onClick={handleToggleLock} disabled={mutating}>
            {user.locked ? <Unlock size={16} className="mr-2" /> : <Lock size={16} className="mr-2" />}
            {user.locked ? 'Unlock' : 'Lock'}
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      {/* User Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Account Details">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-gray-100">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Verified</span>
              <Badge variant={user.email_verified ? 'success' : 'warning'}>
                {user.email_verified ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">2FA</span>
              <Badge variant={user.two_factor_enabled ? 'success' : 'default'}>
                {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <Badge variant={user.locked ? 'error' : 'success'}>
                {user.locked ? 'Locked' : 'Active'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created</span>
              <span className="text-gray-100">{formatDate(user.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Login</span>
              <span className="text-gray-100">{formatDate(user.last_login ?? null)}</span>
            </div>
          </div>
        </Card>

        <Card
          title="Roles"
          footer={
            <Button variant="secondary" size="sm" onClick={openRolesModal}>
              <Shield size={16} className="mr-2" />
              Edit Roles
            </Button>
          }
        >
          <div className="flex flex-wrap gap-2">
            {(user.roles || []).map((role) => (
              <Badge key={role} variant={role === 'admin' ? 'info' : 'default'}>
                {role}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Sessions */}
      <Card
        title="Active Sessions"
        footer={
          sessionsData?.items?.length ? (
            <Button variant="danger" size="sm" onClick={handleRevokeAllSessions}>
              Revoke All Sessions
            </Button>
          ) : undefined
        }
      >
        {!sessionsData?.items?.length ? (
          <EmptyState
            icon={<Monitor size={48} />}
            title="No active sessions"
            description="This user has no active sessions"
          />
        ) : (
          <Table
            columns={[
              {
                key: 'ip_address',
                label: 'IP Address',
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-gray-400" />
                    <span className="font-mono text-sm">{value as string}</span>
                  </div>
                ),
              },
              {
                key: 'created_at',
                label: 'Started',
                render: (value) => formatDate(value as string),
              },
              {
                key: 'current',
                label: 'Status',
                render: (value) => (
                  <Badge variant={value ? 'success' : 'default'}>
                    {value ? 'Current' : 'Active'}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                label: '',
                align: 'right' as const,
                render: (_, row) => {
                  if (row.current) return null;
                  return (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeSession(row.id as string)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  );
                },
              },
            ]}
            data={(sessionsData?.items || []).map((s) => ({
              id: s.id,
              ip_address: s.ip_address,
              created_at: s.created_at,
              current: s.current,
            }))}
          />
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        description="This action cannot be undone"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete <strong className="text-gray-100">{user.email}</strong>?
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

      {/* Roles Modal */}
      <Modal
        open={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        title="Edit Roles"
        description="Select the roles for this user"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {['user', 'admin', 'moderator'].map((role) => (
              <Checkbox
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                checked={newRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setRolesModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateRoles} loading={mutating}>
              Save Roles
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

export default UserDetail;
