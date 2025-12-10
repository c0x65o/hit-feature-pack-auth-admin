/**
 * Auth Admin API hooks
 */
import { useState, useEffect, useCallback } from 'react';
// Get the auth module URL from environment or defaults
function getAuthUrl() {
    if (typeof window !== 'undefined') {
        // Client-side: check window config or default to proxy
        const win = window;
        return win.NEXT_PUBLIC_HIT_AUTH_URL || '/api/proxy/auth';
    }
    // Server-side: use proxy (env vars handled by Next.js)
    return '/api/proxy/auth';
}
function getAuthHeaders() {
    if (typeof window === 'undefined')
        return {};
    const token = localStorage.getItem('hit_token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}
// Custom error class that preserves HTTP status code
class AuthAdminError extends Error {
    constructor(status, detail) {
        super(detail);
        this.name = 'AuthAdminError';
        this.status = status;
        this.detail = detail;
    }
    // Check if this is an auth error (401/403)
    isAuthError() {
        return this.status === 401 || this.status === 403;
    }
}
async function fetchWithAuth(endpoint, options) {
    const authUrl = getAuthUrl();
    const url = `${authUrl}${endpoint}`;
    const res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options?.headers,
        },
    });
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
        const detail = errorBody.detail || errorBody.message || `Request failed: ${res.status}`;
        throw new AuthAdminError(res.status, detail);
    }
    return res.json();
}
export function useStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Stats are computed client-side from other endpoints since auth module
            // doesn't have a dedicated stats endpoint yet
            const [usersRes, sessionsRes, auditRes] = await Promise.allSettled([
                fetchWithAuth('/users'),
                fetchWithAuth('/admin/sessions?limit=1'),
                fetchWithAuth('/audit-log?event_type=login_failure&limit=1000'),
            ]);
            // Check for auth errors first - these should be surfaced to the user
            const usersError = usersRes.status === 'rejected' ? usersRes.reason : null;
            const sessionsError = sessionsRes.status === 'rejected' ? sessionsRes.reason : null;
            const auditError = auditRes.status === 'rejected' ? auditRes.reason : null;
            // If any request got a 401/403, surface that error
            if (usersError instanceof AuthAdminError && usersError.isAuthError()) {
                throw usersError;
            }
            if (sessionsError instanceof AuthAdminError && sessionsError.isAuthError()) {
                throw sessionsError;
            }
            if (auditError instanceof AuthAdminError && auditError.isAuthError()) {
                throw auditError;
            }
            // For other errors (network, etc.), log but continue with partial data
            if (usersError) {
                console.warn('Failed to fetch users for stats:', usersError);
            }
            if (sessionsError) {
                console.warn('Failed to fetch sessions for stats:', sessionsError);
            }
            if (auditError) {
                console.warn('Failed to fetch audit log for stats:', auditError);
            }
            const users = usersRes.status === 'fulfilled' ? usersRes.value : [];
            const totalUsers = users.length;
            const activeSessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.total : 0;
            const twoFactorUsers = users.filter(u => u.two_factor_enabled).length;
            // Calculate failed logins in last 24 hours from audit log
            let failedLogins24h = 0;
            if (auditRes.status === 'fulfilled') {
                const now = new Date();
                const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                failedLogins24h = auditRes.value.events.filter((event) => {
                    const eventDate = new Date(event.created_at);
                    return eventDate >= yesterday;
                }).length;
            }
            // Calculate new users in last 7 days
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const newUsers7d = users.filter(u => {
                const createdDate = new Date(u.created_at);
                return createdDate >= sevenDaysAgo;
            }).length;
            setStats({
                total_users: totalUsers,
                active_sessions: activeSessions,
                failed_logins_24h: failedLogins24h,
                new_users_7d: newUsers7d,
                two_factor_adoption: totalUsers > 0 ? Math.round((twoFactorUsers / totalUsers) * 100) : 0,
                pending_invites: 0, // Invites may be disabled
            });
        }
        catch (e) {
            setError(e);
            setStats(null);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { stats, loading, error, refresh };
}
export function useUsers(options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { page = 1, pageSize = 25, search } = options;
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            // Auth module returns a plain array, not paginated response
            const users = await fetchWithAuth('/users');
            // Filter by search if provided
            let filtered = users;
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = users.filter(u => u.email.toLowerCase().includes(searchLower));
            }
            // Client-side pagination
            const total = filtered.length;
            const startIdx = (page - 1) * pageSize;
            const items = filtered.slice(startIdx, startIdx + pageSize);
            setData({
                items,
                total,
                page,
                page_size: pageSize,
                total_pages: Math.ceil(total / pageSize),
            });
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, pageSize, search]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { data, loading, error, refresh };
}
export function useUser(email) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        if (!email)
            return;
        try {
            setLoading(true);
            const data = await fetchWithAuth(`/users/${encodeURIComponent(email)}`);
            setUser(data);
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, [email]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { user, loading, error, refresh };
}
export function useSessions(options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { page = 1, pageSize = 50, search } = options;
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * pageSize;
            const params = new URLSearchParams({
                limit: String(pageSize),
                offset: String(offset),
            });
            if (search)
                params.set('user_email', search);
            // Auth module returns {sessions: [], total: N, limit: N, offset: N}
            const result = await fetchWithAuth(`/admin/sessions?${params}`);
            setData({
                items: result.sessions,
                total: result.total,
                page,
                page_size: pageSize,
                total_pages: Math.ceil(result.total / pageSize),
            });
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, pageSize, search]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { data, loading, error, refresh };
}
export function useAuditLog(options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { page = 1, pageSize = 50, search } = options;
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * pageSize;
            const params = new URLSearchParams({
                limit: String(pageSize),
                offset: String(offset),
            });
            if (search)
                params.set('user_email', search);
            // Auth module returns {events: [], total: N, limit: N, offset: N}
            const result = await fetchWithAuth(`/audit-log?${params}`);
            setData({
                items: result.events,
                total: result.total,
                page,
                page_size: pageSize,
                total_pages: Math.ceil(result.total / pageSize),
            });
            setError(null);
        }
        catch (e) {
            setError(e);
        }
        finally {
            setLoading(false);
        }
    }, [page, pageSize, search]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { data, loading, error, refresh };
}
export function useInvites(options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { page = 1, pageSize = 25 } = options;
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * pageSize;
            const params = new URLSearchParams({
                limit: String(pageSize),
                offset: String(offset),
            });
            // Auth module may return {invites: [], total: N} or error if invites disabled
            const result = await fetchWithAuth(`/invites?${params}`);
            // Handle both array and object response formats
            const invites = Array.isArray(result) ? result : (result.invites || []);
            const total = Array.isArray(result) ? result.length : (result.total || 0);
            setData({
                items: invites,
                total,
                page,
                page_size: pageSize,
                total_pages: Math.ceil(total / pageSize),
            });
            setError(null);
        }
        catch (e) {
            // If invites are disabled, return empty list instead of error
            const errMsg = e.message || '';
            if (errMsg.includes('disabled') || errMsg.includes('Invite')) {
                setData({
                    items: [],
                    total: 0,
                    page: 1,
                    page_size: pageSize,
                    total_pages: 0,
                });
                setError(null);
            }
            else {
                setError(e);
            }
        }
        finally {
            setLoading(false);
        }
    }, [page, pageSize]);
    useEffect(() => {
        refresh();
    }, [refresh]);
    return { data, loading, error, refresh };
}
// Mutation hooks
export function useUserMutations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const createUser = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth('/users', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const deleteUser = async (email) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
                method: 'DELETE',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const resetPassword = async (email, sendEmail = true, password) => {
        setLoading(true);
        setError(null);
        try {
            if (sendEmail) {
                // Use forgot-password endpoint to trigger password reset email
                await fetchWithAuth('/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify({ email }),
                });
            }
            else {
                // Use admin endpoint to set password directly
                if (!password) {
                    throw new Error('Password is required when setting directly');
                }
                await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/reset-password`, {
                    method: 'POST',
                    body: JSON.stringify({ password, send_email: false }),
                });
            }
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const resendVerification = async (email) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/resend-verification`, {
                method: 'POST',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const verifyEmail = async (email) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/verify`, {
                method: 'PUT',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const updateRoles = async (email, roles) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
                method: 'PUT',
                body: JSON.stringify({ roles }),
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const lockUser = async (email) => {
        setLoading(true);
        setError(null);
        try {
            // Lock by setting locked flag via user update
            await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
                method: 'PUT',
                body: JSON.stringify({ locked: true }),
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const unlockUser = async (email) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
                method: 'PUT',
                body: JSON.stringify({ locked: false }),
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    return {
        createUser,
        deleteUser,
        resetPassword,
        resendVerification,
        verifyEmail,
        updateRoles,
        lockUser,
        unlockUser,
        loading,
        error,
    };
}
export function useSessionMutations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const revokeSession = async (sessionId) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`/sessions/${sessionId}`, {
                method: 'DELETE',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const revokeAllUserSessions = async (email) => {
        setLoading(true);
        setError(null);
        try {
            // Note: Auth module may not have this specific endpoint
            // May need to fetch all sessions for user and delete individually
            await fetchWithAuth(`/sessions?user_email=${encodeURIComponent(email)}`, {
                method: 'DELETE',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    return { revokeSession, revokeAllUserSessions, loading, error };
}
export function useInviteMutations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const createInvite = async (data) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth('/invites', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const resendInvite = async (inviteId) => {
        setLoading(true);
        setError(null);
        try {
            // Resend by creating a new invite with same email
            // Auth module may not have a dedicated resend endpoint
            await fetchWithAuth(`/invites/${inviteId}/resend`, {
                method: 'POST',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    const revokeInvite = async (inviteId) => {
        setLoading(true);
        setError(null);
        try {
            await fetchWithAuth(`/invites/${inviteId}`, {
                method: 'DELETE',
            });
        }
        catch (e) {
            setError(e);
            throw e;
        }
        finally {
            setLoading(false);
        }
    };
    return { createInvite, resendInvite, revokeInvite, loading, error };
}
export function useAuthAdminConfig() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const mapHitConfig = (hitCfg) => {
            if (!hitCfg?.auth)
                return {};
            return {
                allow_signup: hitCfg.auth.allowSignup,
                allow_invited: hitCfg.auth.allowInvited,
                password_reset: hitCfg.auth.passwordReset,
                two_factor_auth: hitCfg.auth.twoFactorAuth,
                audit_log: hitCfg.auth.auditLog,
                magic_link_login: hitCfg.auth.magicLinkLogin,
                email_verification: hitCfg.auth.emailVerification,
                oauth_providers: hitCfg.auth.socialProviders || [],
                rate_limiting: hitCfg.auth.rateLimiting,
                two_factor_required: hitCfg.auth.twoFactorRequired,
                recovery_codes_enabled: hitCfg.auth.recoveryCodesEnabled,
                remember_device: hitCfg.auth.rememberDevice,
                device_fingerprinting: hitCfg.auth.deviceFingerprinting,
                new_device_alerts: hitCfg.auth.newDeviceAlerts,
                lockout_notify_user: hitCfg.auth.lockoutNotifyUser,
            };
        };
        Promise.all([
            fetchWithAuth('/config').catch((e) => {
                setError(e);
                return null;
            }),
            fetch('/hit-config.json').then((res) => res.json()).catch(() => null),
        ])
            .then(([apiRes, hitCfg]) => {
            const apiConfig = (apiRes?.features || apiRes?.data || apiRes);
            const merged = {
                allow_signup: apiConfig?.allow_signup ?? mapHitConfig(hitCfg).allow_signup ?? false,
                allow_invited: apiConfig?.allow_invited ?? mapHitConfig(hitCfg).allow_invited ?? false,
                password_reset: apiConfig?.password_reset ?? mapHitConfig(hitCfg).password_reset ?? true,
                two_factor_auth: apiConfig?.two_factor_auth ?? mapHitConfig(hitCfg).two_factor_auth ?? false,
                audit_log: apiConfig?.audit_log ?? mapHitConfig(hitCfg).audit_log ?? true,
                magic_link_login: apiConfig?.magic_link_login ?? mapHitConfig(hitCfg).magic_link_login ?? false,
                email_verification: apiConfig?.email_verification ?? mapHitConfig(hitCfg).email_verification ?? true,
                oauth_providers: apiConfig?.oauth_providers ?? mapHitConfig(hitCfg).oauth_providers ?? [],
                rate_limiting: apiConfig?.rate_limiting ?? mapHitConfig(hitCfg).rate_limiting ?? true,
                two_factor_required: apiConfig?.two_factor_required ?? mapHitConfig(hitCfg).two_factor_required ?? false,
                recovery_codes_enabled: apiConfig?.recovery_codes_enabled ?? mapHitConfig(hitCfg).recovery_codes_enabled ?? true,
                remember_device: apiConfig?.remember_device ?? mapHitConfig(hitCfg).remember_device ?? true,
                device_fingerprinting: apiConfig?.device_fingerprinting ?? mapHitConfig(hitCfg).device_fingerprinting ?? false,
                new_device_alerts: apiConfig?.new_device_alerts ?? mapHitConfig(hitCfg).new_device_alerts ?? true,
                lockout_notify_user: apiConfig?.lockout_notify_user ?? mapHitConfig(hitCfg).lockout_notify_user ?? true,
            };
            setConfig(merged);
            setError(null);
        })
            .catch((e) => setError(e))
            .finally(() => setLoading(false));
    }, []);
    return { config, loading, error };
}
// Export types and error class
export { AuthAdminError };
//# sourceMappingURL=useAuthAdmin.js.map