/**
 * Navigation configuration for auth-admin feature pack
 */
export interface NavItem {
    id: string;
    label: string;
    path: string;
    icon: string;
    roles?: string[];
    children?: Omit<NavItem, 'children' | 'id'>[];
}
export declare const nav: NavItem[];
//# sourceMappingURL=nav.d.ts.map