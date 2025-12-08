'use client';

import React, { useState } from 'react';
import { Mail, RefreshCw, Trash2, Send, UserPlus, Clock } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useInvites, useInviteMutations, type Invite } from '../hooks/useAuthAdmin';

interface InvitesProps {
  onNavigate?: (path: string) => void;
}

export function Invites({ onNavigate }: InvitesProps) {
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRoles, setNewRoles] = useState<string[]>(['user']);

  const { data, loading, error, refresh } = useInvites({ page, pageSize: 25 });
  const { createInvite, resendInvite, revokeInvite, loading: mutating } = useInviteMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleCreateInvite = async () => {
    try {
      await createInvite({ email: newEmail, roles: newRoles });
      setCreateModalOpen(false);
      setNewEmail('');
      setNewRoles(['user']);
      refresh();
    } catch {
      // Error handled by hook
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    if (confirm('Resend this invitation?')) {
      try {
        await resendInvite(inviteId);
        alert('Invitation resent!');
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      try {
        await revokeInvite(inviteId);
        refresh();
      } catch {
        // Error handled by hook
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatus = (invite: Invite): { label: string; variant: 'success' | 'warning' | 'error' | 'default' } => {
    if (invite.accepted_at) {
      return { label: 'Accepted', variant: 'success' };
    }
    if (isExpired(invite.expires_at)) {
      return { label: 'Expired', variant: 'error' };
    }
    return { label: 'Pending', variant: 'warning' };
  };

  const toggleRole = (role: string) => {
    if (newRoles.includes(role)) {
      setNewRoles(newRoles.filter((r) => r !== role));
    } else {
      setNewRoles([...newRoles, role]);
    }
  };

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (invite: Invite) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[var(--hit-muted-foreground)]" />
          <span className="font-medium">{invite.email}</span>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (invite: Invite) => (
        <div className="flex flex-wrap gap-1">
          {invite.roles.map((role) => (
            <Badge key={role} variant={role === 'admin' ? 'info' : 'default'}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'invited_by',
      label: 'Invited By',
      render: (invite: Invite) => (
        <button
          className="text-[var(--hit-primary)] hover:text-[var(--hit-primary-hover)]"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/users/${encodeURIComponent(invite.invited_by)}`);
          }}
        >
          {invite.invited_by}
        </button>
      ),
    },
    {
      key: 'created_at',
      label: 'Sent',
      render: (invite: Invite) => formatDate(invite.created_at),
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (invite: Invite) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--hit-muted-foreground)]" />
          <span>{formatDate(invite.expires_at)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (invite: Invite) => {
        const status = getStatus(invite);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invites"
        description="Manage user invitations"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={() => refresh()}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={UserPlus}
              onClick={() => setCreateModalOpen(true)}
            >
              Send Invite
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={loading}
        error={error}
        page={page}
        totalPages={data?.total_pages || 1}
        onPageChange={setPage}
        rowActions={(invite) => {
          const status = getStatus(invite);
          if (status.label === 'Accepted') return null;
          
          return (
            <>
              {status.label === 'Pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Send}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResendInvite(invite.id);
                  }}
                  loading={mutating}
                >
                  Resend
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                className="text-[var(--hit-error)] hover:text-[var(--hit-error-dark)]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRevokeInvite(invite.id);
                }}
                loading={mutating}
              >
                Revoke
              </Button>
            </>
          );
        }}
        emptyMessage="No invites found"
      />

      {/* Create Invite Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Send Invitation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateInvite}
              loading={mutating}
              disabled={!newEmail}
            >
              Send Invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--hit-foreground)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--hit-border)] rounded-lg bg-[var(--hit-input-bg)] text-[var(--hit-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--hit-primary)]"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--hit-foreground)] mb-2">
              Roles
            </label>
            <div className="space-y-2">
              {['admin', 'user', 'moderator', 'viewer'].map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--hit-border)] cursor-pointer hover:bg-[var(--hit-surface-hover)]"
                >
                  <input
                    type="checkbox"
                    checked={newRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="w-4 h-4 text-[var(--hit-primary)] rounded focus:ring-[var(--hit-primary)]"
                  />
                  <span className="text-[var(--hit-foreground)] capitalize">
                    {role}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Invites;
