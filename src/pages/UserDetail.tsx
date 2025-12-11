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
  Mail,
  CheckCircle,
} from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { formatDateTime } from '@hit/sdk';
import {
  useUser,
  useSessions,
  useUserMutations,
  useSessionMutations,
  useAuthAdminConfig,
} from '../hooks/useAuthAdmin';

interface UserDetailProps {
  email: string;
  onNavigate?: (path: string) => void;
}

export function UserDetail({ email, onNavigate }: UserDetailProps) {
  const { Page, Card, Button, Badge, Table, Modal, Alert, Spinner, EmptyState, Select } = useUi();
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<string[]>(['admin', 'user']);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordMethod, setResetPasswordMethod] = useState<'email' | 'direct'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const { user, loading, error, refresh } = useUser(email);
  const { config: authConfig } = useAuthAdminConfig();
  
  // Fetch available roles from features endpoint
  React.useEffect(() => {
    const fetchAvailableRoles = async () => {
      try {
        const response = await fetch('/features');
        const data = await response.json();
        const roles = data.features?.available_roles || ['admin', 'user'];
        setAvailableRoles(roles);
      } catch (e) {
        // Fallback to default roles
        setAvailableRoles(['admin', 'user']);
      }
    };
    fetchAvailableRoles();
  }, []);
  const { data: sessionsData, refresh: refreshSessions } = useSessions({ search: email });
  const {
    deleteUser,
    resetPassword,
    resendVerification,
    verifyEmail,
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
    setResetPasswordModalOpen(true);
    setResetPasswordSuccess(null);
    setResetPasswordError(null);
  };

  const handleResetPasswordSubmit = async () => {
    setResetPasswordSuccess(null);
    setResetPasswordError(null);
    
    if (resetPasswordMethod === 'email') {
      try {
        await resetPassword(email, true);
        setResetPasswordSuccess('Password reset email sent successfully!');
        setTimeout(() => {
          setResetPasswordModalOpen(false);
          setResetPasswordMethod('email');
          setNewPassword('');
          setConfirmPassword('');
          setResetPasswordSuccess(null);
        }, 2000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email';
        setResetPasswordError(errorMessage);
      }
    } else {
      // Direct password set
      if (!newPassword) {
        setResetPasswordError('Password is required');
        return;
      }
      if (newPassword !== confirmPassword) {
        setResetPasswordError('Passwords do not match');
        return;
      }
      try {
        await resetPassword(email, false, newPassword);
        setResetPasswordSuccess('Password has been reset successfully!');
        setTimeout(() => {
          setResetPasswordModalOpen(false);
          setResetPasswordMethod('email');
          setNewPassword('');
          setConfirmPassword('');
          setResetPasswordSuccess(null);
          refresh();
        }, 2000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
        setResetPasswordError(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    if (confirm(`Resend verification email to ${email}?`)) {
      try {
        await resendVerification(email);
        alert('Verification email sent!');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleVerifyEmail = async () => {
    if (confirm(`Mark email as verified for ${email}?`)) {
      try {
        await verifyEmail(email);
        refresh();
        alert('Email verified successfully!');
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
    if (!newRole) {
      alert('Please select a role');
      return;
    }
    try {
      await updateRoles(email, newRole);
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

  const formatDateOrNever = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    return formatDateTime(dateStr);
  };

  const openRolesModal = () => {
    // Support both new single role and legacy roles array
    const currentRole = user?.role || (user?.roles && user.roles.length > 0 ? user.roles[0] : 'user') || 'user';
    setNewRole(currentRole);
    setRolesModalOpen(true);
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
          {!user.email_verified && (
            <>
              <Button variant="secondary" onClick={handleVerifyEmail} disabled={mutating}>
                <CheckCircle size={16} className="mr-2" />
                Verify
              </Button>
              <Button variant="secondary" onClick={handleResendVerification} disabled={mutating}>
                <Mail size={16} className="mr-2" />
                Resend Verification
              </Button>
            </>
          )}
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
              <span className="text-gray-900 dark:text-gray-100">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Verified</span>
              <Badge variant={user.email_verified ? 'success' : 'warning'}>
                {user.email_verified ? 'Yes' : 'No'}
              </Badge>
            </div>
            {authConfig?.two_factor_auth !== false && (
              <div className="flex justify-between">
                <span className="text-gray-400">2FA</span>
                <Badge variant={user.two_factor_enabled ? 'success' : 'default'}>
                  {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <Badge variant={user.locked ? 'error' : 'success'}>
                {user.locked ? 'Locked' : 'Active'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created</span>
              <span className="text-gray-900 dark:text-gray-100">{formatDateOrNever(user.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Login</span>
              <span className="text-gray-900 dark:text-gray-100">{formatDateOrNever(user.last_login ?? null)}</span>
            </div>
          </div>
        </Card>

        <Card
          title="Role"
          footer={
            <Button variant="secondary" size="sm" onClick={openRolesModal}>
              <Shield size={16} className="mr-2" />
              Edit Role
            </Button>
          }
        >
          <div className="flex flex-wrap gap-2">
            {(() => {
              // Support both new single role and legacy roles array
              const userRole = user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'user') || 'user';
              return (
                <Badge key={userRole} variant={userRole === 'admin' ? 'info' : 'default'}>
                  {userRole}
                </Badge>
              );
            })()}
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
                render: (value) => formatDateOrNever(value as string),
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
            Are you sure you want to delete <strong className="text-gray-900 dark:text-gray-100">{user.email}</strong>?
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
        title="Edit Role"
        description="Select the role for this user"
      >
        <div className="space-y-4">
          <Select
            label="Role"
            value={newRole}
            onChange={(value) => setNewRole(value)}
            options={availableRoles.map((role) => ({
              value: role,
              label: role.charAt(0).toUpperCase() + role.slice(1),
            }))}
            placeholder="Select a role"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setRolesModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateRoles} loading={mutating}>
              Save Role
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={resetPasswordModalOpen}
        onClose={() => {
          setResetPasswordModalOpen(false);
          setResetPasswordMethod('email');
          setNewPassword('');
          setConfirmPassword('');
          setResetPasswordSuccess(null);
          setResetPasswordError(null);
        }}
        title="Reset Password"
        description="Choose how to reset the password for this user"
      >
        <div className="space-y-4">
          {/* Success Alert */}
          {resetPasswordSuccess && (
            <Alert variant="success" title="Success">
              {resetPasswordSuccess}
            </Alert>
          )}
          
          {/* Error Alert */}
          {resetPasswordError && (
            <Alert variant="error" title="Error">
              {resetPasswordError}
            </Alert>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="reset-email"
                checked={resetPasswordMethod === 'email'}
                onChange={() => setResetPasswordMethod('email')}
                className="w-4 h-4"
              />
              <label htmlFor="reset-email" className="cursor-pointer">
                <div className="font-medium">Send reset email</div>
                <div className="text-sm text-gray-400">
                  Send a password reset link via email through the email provider module
                </div>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="reset-direct"
                checked={resetPasswordMethod === 'direct'}
                onChange={() => setResetPasswordMethod('direct')}
                className="w-4 h-4"
              />
              <label htmlFor="reset-direct" className="cursor-pointer">
                <div className="font-medium">Set password directly</div>
                <div className="text-sm text-gray-400">
                  Type in a new password to change it immediately
                </div>
              </label>
            </div>
          </div>

          {resetPasswordMethod === 'direct' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setResetPasswordModalOpen(false);
                setResetPasswordMethod('email');
                setNewPassword('');
                setConfirmPassword('');
                setResetPasswordSuccess(null);
                setResetPasswordError(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResetPasswordSubmit} loading={mutating}>
              {resetPasswordMethod === 'email' ? 'Send Reset Email' : 'Set Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

export default UserDetail;
