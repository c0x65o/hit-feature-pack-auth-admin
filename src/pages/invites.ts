/**
 * Invite Management Page Generator
 */

import type { UISpec, RequestContext } from '@hit/feature-pack-types';

interface AuthAdminOptions {
  show_invite_management?: boolean;
  invites_per_page?: number;
  allow_send_invite?: boolean;
  allow_resend_invite?: boolean;
  allow_cancel_invite?: boolean;
  allow_bulk_invite?: boolean;
  invite_role_selection?: boolean;
  invite_custom_message?: boolean;
  show_invite_status?: boolean;
  show_invite_sent_by?: boolean;
  show_invite_sent_date?: boolean;
  show_invite_expiry_date?: boolean;
  show_invite_accepted_date?: boolean;
}

export async function invites(ctx: RequestContext): Promise<UISpec> {
  const options = ctx.options as AuthAdminOptions;
  const authUrl = ctx.moduleUrls.auth;

  if (!options.show_invite_management) {
    return {
      type: 'Container',
      children: [
        {
          type: 'Text',
          content: 'Invite management is not available',
          variant: 'h2',
        },
      ],
    };
  }

  const children: UISpec[] = [];

  // Title and actions
  children.push({
    type: 'Row',
    justify: 'between',
    align: 'center',
    className: 'mb-6',
    children: [
      {
        type: 'Text',
        content: 'User Invites',
        variant: 'h2',
      },
      ...(options.allow_send_invite
        ? [
            {
              type: 'Button',
              label: 'Send Invite',
              variant: 'primary',
              onClick: {
                type: 'openDialog',
                dialog: 'sendInvite',
              },
            },
          ]
        : []),
    ],
  });

  // Send invite dialog
  if (options.allow_send_invite) {
    children.push({
      type: 'Dialog',
      id: 'sendInvite',
      title: 'Send Invite',
      children: [
        {
          type: 'Form',
          action: `${authUrl}/invites`,
          method: 'POST',
          children: [
            {
              type: 'FormField',
              name: 'email',
              label: 'Email Address',
              inputType: 'email',
              required: true,
              placeholder: 'user@example.com',
            },
            ...(options.invite_role_selection
              ? [
                  {
                    type: 'FormField',
                    name: 'role',
                    label: 'Role',
                    inputType: 'select',
                    options: [
                      { value: 'user', label: 'User' },
                      { value: 'admin', label: 'Admin' },
                      { value: 'manager', label: 'Manager' },
                    ],
                  },
                ]
              : []),
            ...(options.invite_custom_message
              ? [
                  {
                    type: 'FormField',
                    name: 'message',
                    label: 'Custom Message',
                    inputType: 'textarea',
                    placeholder: 'Optional message to include in the invite',
                  },
                ]
              : []),
            {
              type: 'Button',
              label: 'Send Invite',
              variant: 'primary',
              type: 'submit',
              className: 'w-full mt-4',
            },
          ],
          onSubmit: {
            type: 'api',
            method: 'POST',
            url: `${authUrl}/invites`,
            onSuccess: {
              type: 'closeDialog',
              dialog: 'sendInvite',
            },
            onError: {
              type: 'showMessage',
              variant: 'error',
            },
          },
        },
      ],
    });
  }

  // Invites table
  const columns: any[] = [
    {
      key: 'email',
      label: 'Email',
    },
  ];

  if (options.show_invite_sent_by) {
    columns.push({
      key: 'inviter_email',
      label: 'Sent By',
    });
  }

  if (options.show_invite_status) {
    columns.push({
      key: 'status',
      label: 'Status',
      render: (invite: any) => {
        const status = invite.status || 'pending';
        return status.charAt(0).toUpperCase() + status.slice(1);
      },
    });
  }

  if (options.show_invite_sent_date) {
    columns.push({
      key: 'created_at',
      label: 'Sent Date',
      render: (invite: any) => {
        if (!invite.created_at) return '-';
        return new Date(invite.created_at).toLocaleDateString();
      },
    });
  }

  if (options.show_invite_expiry_date) {
    columns.push({
      key: 'expires_at',
      label: 'Expires',
      render: (invite: any) => {
        if (!invite.expires_at) return '-';
        return new Date(invite.expires_at).toLocaleDateString();
      },
    });
  }

  if (options.show_invite_accepted_date) {
    columns.push({
      key: 'accepted_at',
      label: 'Accepted',
      render: (invite: any) => {
        if (!invite.accepted_at) return '-';
        return new Date(invite.accepted_at).toLocaleDateString();
      },
    });
  }

  columns.push({
    key: 'actions',
    label: 'Actions',
    render: (invite: any) => {
      const actions: any[] = [];

      if (invite.status === 'pending' && options.allow_resend_invite) {
        actions.push({
          type: 'Button',
          label: 'Resend',
          variant: 'outline',
          size: 'sm',
          onClick: {
            type: 'api',
            method: 'POST',
            url: `${authUrl}/invites/${invite.id}/resend`,
            onSuccess: {
              type: 'showMessage',
              message: 'Invite resent',
              variant: 'success',
            },
          },
        });
      }

      if (invite.status === 'pending' && options.allow_cancel_invite) {
        actions.push({
          type: 'Button',
          label: 'Cancel',
          variant: 'destructive',
          size: 'sm',
          onClick: {
            type: 'api',
            method: 'DELETE',
            url: `${authUrl}/invites/${invite.id}`,
            onSuccess: {
              type: 'refresh',
            },
          },
        });
      }

      return actions;
    },
  });

  children.push({
    type: 'DataTable',
    dataSource: {
      type: 'api',
      method: 'GET',
      url: `${authUrl}/invites`,
      params: {
        status: 'pending',
      },
    },
    columns,
    pagination: {
      pageSize: options.invites_per_page || 25,
    },
  });

  return {
    type: 'Container',
    maxWidth: 'full',
    className: 'p-6',
    children,
  };
}
