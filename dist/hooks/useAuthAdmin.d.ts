/**
 * Auth Admin API hooks
 */
interface User {
    email: string;
    email_verified: boolean;
    two_factor_enabled: boolean;
    roles?: string[];
    metadata?: {
        role?: string;
        [key: string]: unknown;
    };
    created_at: string;
    updated_at?: string;
    last_login?: string | null;
    oauth_providers?: string[];
    locked?: boolean;
}
interface Session {
    id: string;
    user_email: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    expires_at: string;
    current?: boolean;
}
interface AuditLogEntry {
    id: string;
    user_email: string;
    event_type: string;
    ip_address: string;
    user_agent?: string;
    details?: Record<string, unknown>;
    created_at: string;
}
interface Invite {
    id: string;
    email: string;
    roles: string[];
    invited_by: string;
    created_at: string;
    expires_at: string;
    accepted_at: string | null;
}
interface Stats {
    total_users: number;
    active_sessions: number;
    failed_logins_24h: number;
    new_users_7d: number;
    two_factor_adoption: number;
    pending_invites: number;
}
interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
interface UseQueryOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
declare class AuthAdminError extends Error {
    status: number;
    detail: string;
    constructor(status: number, detail: string);
    isAuthError(): boolean;
}
export declare function useStats(): {
    stats: Stats | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useUsers(options?: UseQueryOptions): {
    data: PaginatedResponse<User> | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useUser(email: string): {
    user: User | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useSessions(options?: UseQueryOptions): {
    data: PaginatedResponse<Session> | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useAuditLog(options?: UseQueryOptions): {
    data: PaginatedResponse<AuditLogEntry> | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useInvites(options?: UseQueryOptions): {
    data: PaginatedResponse<Invite> | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useUserMutations(): {
    createUser: (data: {
        email: string;
        password: string;
        roles?: string[];
    }) => Promise<void>;
    deleteUser: (email: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateRoles: (email: string, roles: string[]) => Promise<void>;
    lockUser: (email: string) => Promise<void>;
    unlockUser: (email: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
};
export declare function useSessionMutations(): {
    revokeSession: (sessionId: string) => Promise<void>;
    revokeAllUserSessions: (email: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
};
export declare function useInviteMutations(): {
    createInvite: (data: {
        email: string;
        roles?: string[];
    }) => Promise<void>;
    resendInvite: (inviteId: string) => Promise<void>;
    revokeInvite: (inviteId: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
};
interface AuthAdminConfig {
    allow_signup: boolean;
    password_reset: boolean;
    two_factor_auth: boolean;
    audit_log: boolean;
    magic_link_login: boolean;
    email_verification: boolean;
    oauth_providers: string[];
}
export declare function useAuthAdminConfig(): {
    config: AuthAdminConfig | null;
    loading: boolean;
    error: Error | null;
};
export { AuthAdminError };
export type { User, Session, AuditLogEntry, Invite, Stats, PaginatedResponse, AuthAdminConfig };
//# sourceMappingURL=useAuthAdmin.d.ts.map