'use client';

import React, { useState } from 'react';
import { RefreshCw, Trash2, Send, UserPlus, Clock } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useInvites, useInviteMutations } from '../hooks/useAuthAdmin';

interface InvitesProps {
  onNavigate?: (path: string) => void;
}

export function Invites({ onNavigate }: InvitesProps) {
  const { Page, Card, Button, Badge, Table, Modal, Input, Select, Alert, Spinner, EmptyState } = useUi();
  
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');

  const { data, loading, error, refresh } = useInvites({ page, pageSize: 25 });
  const { createInvite, resendInvite, revokeInvite, loading: mutating } = useInviteMutations();

  const handleCreateInvite = async () => {
    try {
      await createInvite({ email: newEmail, roles: [newRole] });
      setCreateModalOpen(false);
      setNewEmail('');
      setNewRole('user');
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

  return (
    <Page
      title="Invitations"
      description="Manage user invitations"
      actions={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refresh()}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <UserPlus size={16} className="mr-2" />
            Send Invite
          </Button>
        </div>
      }
    >
      {error && (
        <Alert variant="error" title="Error loading invites">
          {error.message}
        </Alert>
      )}

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !data?.items?.length ? (
          <EmptyState
            icon={<Clock size={48} />}
            title="No pending invitations"
            description="Send an invitation to add new users"
            action={
              <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                <UserPlus size={16} className="mr-2" />
                Send Invite
              </Button>
            }
          />
        ) : (
          <>
            <Table
              columns={[
                {
                  key: 'email',
                  label: 'Email',
                  render: (value) => <span className="font-medium">{value as string}</span>,
                },
                {
                  key: 'roles',
                  label: 'Roles',
                  render: (value) => (
                    <div className="flex gap-1">
                      {(value as string[])?.map((role) => (
                        <Badge key={role} variant={role === 'admin' ? 'info' : 'default'}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (_, row) => {
                    const expired = isExpired(row.expires_at as string);
                    const accepted = !!row.accepted_at;
                    return (
                      <Badge variant={accepted ? 'success' : expired ? 'error' : 'warning'}>
                        {accepted ? 'Accepted' : expired ? 'Expired' : 'Pending'}
                      </Badge>
                    );
                  },
                },
                {
                  key: 'expires_at',
                  label: 'Expires',
                  render: (value) => formatDate(value as string),
                },
                {
                  key: 'actions',
                  label: '',
                  align: 'right' as const,
                  render: (_, row) => {
                    if (row.accepted_at) return null;
                    return (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvite(row.id as string)}
                          disabled={mutating}
                        >
                          <Send size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeInvite(row.id as string)}
                          disabled={mutating}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    );
                  },
                },
              ]}
              data={(data?.items || []).map((invite) => ({
                id: invite.id,
                email: invite.email,
                roles: invite.roles,
                expires_at: invite.expires_at,
                accepted_at: invite.accepted_at,
              }))}
              emptyMessage="No invitations found"
            />

            {data.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 mt-6 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Page {data.page} of {data.total_pages}
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

      {/* Create Invite Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Send Invitation"
        description="Invite a new user to join"
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
          <Select
            label="Role"
            options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={newRole}
            onChange={setNewRole}
          />
          <div className="flex justify-end gap-3 pt-4">
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
          </div>
        </div>
      </Modal>
    </Page>
  );
}

export default Invites;
