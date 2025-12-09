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
export declare function createImpersonationBanner(ctx: RequestContext, options: ImpersonationBannerOptions): UISpec;
export {};
//# sourceMappingURL=impersonation-banner.d.ts.map