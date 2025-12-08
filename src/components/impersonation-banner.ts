/**
 * Impersonation Banner Component
 * 
 * This component should be rendered at the layout level to show
 * an impersonation warning banner when an admin is impersonating a user.
 */

import type { UISpec, RequestContext } from '@hit/feature-pack-types';

interface ImpersonationBannerOptions {
  impersonate_warning_text?: string;
  impersonate_banner_color?: 'warning' | 'error' | 'info';
  impersonate_end_button?: boolean;
}

export function createImpersonationBanner(
  ctx: RequestContext,
  options: ImpersonationBannerOptions
): UISpec | null {
  // Check if user is impersonating (from JWT token claims)
  // This would be checked in the actual rendering layer
  // For now, return the banner spec that can be conditionally rendered
  
  const authUrl = ctx.moduleUrls.auth;
  
  return {
    type: 'Conditional',
    condition: {
      type: 'tokenClaim',
      claim: 'impersonated',
      operator: 'equals',
      value: true,
    },
    children: [
      {
        type: 'Alert',
        variant: options.impersonate_banner_color || 'warning',
        title: options.impersonate_warning_text || 'You are viewing as another user',
        className: 'mb-4',
        children: [
          {
            type: 'Row',
            justify: 'between',
            align: 'center',
            children: [
              {
                type: 'Text',
                content: `Viewing as: {user_email} | Admin: {impersonated_by}`,
                variant: 'body',
              },
              ...(options.impersonate_end_button
                ? [
                    {
                      type: 'Button',
                      label: 'End Impersonation',
                      variant: 'outline',
                      size: 'sm',
                      onClick: {
                        type: 'api',
                        method: 'POST',
                        url: `${authUrl}/impersonate/end`,
                        onSuccess: {
                          type: 'updateAuth',
                          redirect: '/admin/users',
                        },
                      },
                    },
                  ]
                : []),
            ],
          },
        ],
      },
    ],
  };
}
