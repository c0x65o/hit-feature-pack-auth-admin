'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Shield,
  Key,
  Clock,
  Globe,
  Lock,
  Unlock,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
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
    if (!user) return;
    const action = user.locked ? unlockUser : lockUser;
    const actionName = user.locked ? 'unlock' : 'lock';
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
    if (newRoles.includes(role)) {
      setNewRoles(newRoles.filter((r) => r !== role));
    } else {
      setNewRoles([...newRoles, role]);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error?.message || 'User not found'}</p>
        <Button variant="outline" onClick={() => navigate('/admin/users')} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  const sessionColumns = [
    { key: 'ip_address', label: 'IP Address' },
    {
      key: 'user_agent',
      label: 'Device',
      render: (session: { user_agent: string }) => (
        <span className="text-sm truncate max-w-xs block">
          {session.user_agent?.split(' ')[0] || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Started',
      render: (session: { created_at: string }) => formatDate(session.created_at),
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (session: { expires_at: string }) => formatDate(session.expires_at),
    },
    {
      key: 'current',
      label: 'Status',
      render: (session: { current?: boolean }) =>
        session.current ? (
          <Badge variant="success">Current</Badge>
        ) : (
          <Badge variant="default">Active</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/admin/users')}
        >
          Back
        </Button>
      </div>

      <PageHeader
        title={user.email}
        description={`User account details`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={Key}
              onClick={handleResetPassword}
              loading={mutating}
            >
              Reset Password
            </Button>
            <Button
              variant="outline"
              icon={user.locked ? Unlock : Lock}
              onClick={handleToggleLock}
              loading={mutating}
            >
              {user.locked ? 'Unlock' : 'Lock'}
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* User Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Details
          </h3>
          <dl className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-gray-900 dark:text-gray-100">{user.email}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <dt className="text-sm text-gray-500">Email Verified</dt>
                <dd>
                  <Badge variant={user.email_verified ? 'success' : 'warning'}>
                    {user.email_verified ? 'Verified' : 'Pending'}
                  </Badge>
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-400" />
              <div>
                <dt className="text-sm text-gray-500">Two-Factor Auth</dt>
                <dd>
                  <Badge variant={user.two_factor_enabled ? 'success' : 'default'}>
                    {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <dt className="text-sm text-gray-500">Account Status</dt>
                <dd>
                  <Badge variant={user.locked ? 'error' : 'success'}>
                    {user.locked ? 'Locked' : 'Active'}
                  </Badge>
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Roles & Permissions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Roles & Permissions
            </h3>
            <Button variant="ghost" size="sm" onClick={openRolesModal}>
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.roles.length === 0 ? (
              <span className="text-gray-500">No roles assigned</span>
            ) : (
              user.roles.map((role) => (
                <Badge
                  key={role}
                  variant={role === 'admin' ? 'info' : 'default'}
                  size="md"
                >
                  {role}
                </Badge>
              ))
            )}
          </div>

          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-6 mb-2">
            Activity
          </h4>
          <dl className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="text-sm">
                <dt className="text-gray-500 inline">Created: </dt>
                <dd className="text-gray-900 dark:text-gray-100 inline">
                  {formatDate(user.created_at)}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <div className="text-sm">
                <dt className="text-gray-500 inline">Last Login: </dt>
                <dd className="text-gray-900 dark:text-gray-100 inline">
                  {formatDate(user.last_login)}
                </dd>
              </div>
            </div>
          </dl>

          {user.oauth_providers && user.oauth_providers.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-6 mb-2">
                Connected Accounts
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.oauth_providers.map((provider) => (
                  <Badge key={provider} variant="default">
                    {provider}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Active Sessions
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => refreshSessions()}
            >
              Refresh
            </Button>
            {sessionsData?.items && sessionsData.items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRevokeAllSessions}
              >
                Revoke All
              </Button>
            )}
          </div>
        </div>
        <DataTable
          columns={sessionColumns}
          data={sessionsData?.items || []}
          emptyMessage="No active sessions"
          rowActions={(session: { id: string; current?: boolean }) =>
            !session.current && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevokeSession(session.id)}
              >
                Revoke
              </Button>
            )
          }
        />
      </div>

      {/* Delete Modal */}
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
          <strong className="text-gray-900 dark:text-gray-100">{user.email}</strong>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Roles Modal */}
      <Modal
        isOpen={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        title="Edit Roles"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRolesModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateRoles}
              loading={mutating}
            >
              Save Roles
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {['admin', 'user', 'moderator', 'viewer'].map((role) => (
            <label
              key={role}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <input
                type="checkbox"
                checked={newRoles.includes(role)}
                onChange={() => toggleRole(role)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-900 dark:text-gray-100 capitalize">
                {role}
              </span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default UserDetail;
