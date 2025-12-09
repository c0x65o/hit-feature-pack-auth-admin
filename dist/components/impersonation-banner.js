/**
 * Impersonation Banner Component
 *
 * This component should be rendered at the layout level to show
 * an impersonation warning banner when an admin is impersonating a user.
 */
export function createImpersonationBanner(ctx, options) {
    // Check if user is impersonating (from JWT token claims)
    // This would be checked in the actual rendering layer
    // For now, return a simple alert banner
    const authUrl = ctx.moduleUrls.auth;
    // This is a simplified version - real implementation would check JWT claims
    return {
        type: 'Alert',
        variant: options.impersonate_banner_color || 'warning',
        title: options.impersonate_warning_text || 'You are viewing as another user',
        message: 'Use the "End Impersonation" button to return to your account.',
        className: 'mb-4',
    };
}
//# sourceMappingURL=impersonation-banner.js.map