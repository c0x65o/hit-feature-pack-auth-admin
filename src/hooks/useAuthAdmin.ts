/**
 * Auth Admin API hooks
 */

import { useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  roles?: string[];
  metadata?: { role?: string; [key: string]: unknown };
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

// Get the auth module URL from environment or defaults
function getAuthUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: check window config or default to proxy
    const win = window as unknown as Record<string, string>;
    return win.NEXT_PUBLIC_HIT_AUTH_URL || '/api/proxy/auth';
  }
  // Server-side: use proxy (env vars handled by Next.js)
  return '/api/proxy/auth';
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('hit_token');
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

async function fetchWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      // Stats are computed client-side from other endpoints since auth module
      // doesn't have a dedicated stats endpoint yet
      const [usersRes, sessionsRes] = await Promise.allSettled([
        fetchWithAuth<User[]>('/users'),
        fetchWithAuth<{sessions: Session[], total: number}>('/admin/sessions?limit=1'),
      ]);
      
      const users = usersRes.status === 'fulfilled' ? usersRes.value : [];
      const totalUsers = users.length;
      const activeSessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.total : 0;
      const twoFactorUsers = users.filter(u => u.two_factor_enabled).length;
      
      setStats({
        total_users: totalUsers,
        active_sessions: activeSessions,
        failed_logins_24h: 0, // Would need audit log query
        new_users_7d: 0, // Would need users query with date filter
        two_factor_adoption: totalUsers > 0 ? Math.round((twoFactorUsers / totalUsers) * 100) : 0,
        pending_invites: 0, // Invites may be disabled
      });
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}

export function useUsers(options: UseQueryOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { page = 1, pageSize = 25, search } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      // Auth module returns a plain array, not paginated response
      const users = await fetchWithAuth<User[]>('/users');
      
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
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useUser(email: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!email) return;
    try {
      setLoading(true);
      const data = await fetchWithAuth<User>(`/users/${encodeURIComponent(email)}`);
      setUser(data);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, error, refresh };
}

export function useSessions(options: UseQueryOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Session> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { page = 1, pageSize = 50, search } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
      });
      if (search) params.set('user_email', search);

      // Auth module returns {sessions: [], total: N, limit: N, offset: N}
      const result = await fetchWithAuth<{sessions: Session[], total: number, limit: number, offset: number}>(`/admin/sessions?${params}`);
      
      setData({
        items: result.sessions,
        total: result.total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(result.total / pageSize),
      });
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useAuditLog(options: UseQueryOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<AuditLogEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { page = 1, pageSize = 50, search } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * pageSize;
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
      });
      if (search) params.set('user_email', search);

      // Auth module returns {events: [], total: N, limit: N, offset: N}
      const result = await fetchWithAuth<{events: AuditLogEntry[], total: number, limit: number, offset: number}>(`/audit-log?${params}`);
      
      setData({
        items: result.events,
        total: result.total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(result.total / pageSize),
      });
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

export function useInvites(options: UseQueryOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Invite> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
      const result = await fetchWithAuth<{invites?: Invite[], total?: number} | Invite[]>(`/invites?${params}`);
      
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
    } catch (e) {
      // If invites are disabled, return empty list instead of error
      const errMsg = (e as Error).message || '';
      if (errMsg.includes('disabled') || errMsg.includes('Invite')) {
        setData({
          items: [],
          total: 0,
          page: 1,
          page_size: pageSize,
          total_pages: 0,
        });
        setError(null);
      } else {
        setError(e as Error);
      }
    } finally {
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
  const [error, setError] = useState<Error | null>(null);

  const createUser = async (data: { email: string; password: string; roles?: string[] }) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use forgot-password endpoint to trigger password reset email
      await fetchWithAuth('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const updateRoles = async (email: string, roles: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        body: JSON.stringify({ roles }),
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const lockUser = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // Lock by setting locked flag via user update
      await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        body: JSON.stringify({ locked: true }),
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const unlockUser = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/users/${encodeURIComponent(email)}`, {
        method: 'PUT',
        body: JSON.stringify({ locked: false }),
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    createUser,
    deleteUser,
    resetPassword,
    updateRoles,
    lockUser,
    unlockUser,
    loading,
    error,
  };
}

export function useSessionMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const revokeSession = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const revokeAllUserSessions = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // Note: Auth module may not have this specific endpoint
      // May need to fetch all sessions for user and delete individually
      await fetchWithAuth(`/sessions?user_email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { revokeSession, revokeAllUserSessions, loading, error };
}

export function useInviteMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createInvite = async (data: { email: string; roles?: string[] }) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth('/invites', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const resendInvite = async (inviteId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Resend by creating a new invite with same email
      // Auth module may not have a dedicated resend endpoint
      await fetchWithAuth(`/invites/${inviteId}/resend`, {
        method: 'POST',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const revokeInvite = async (inviteId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchWithAuth(`/invites/${inviteId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createInvite, resendInvite, revokeInvite, loading, error };
}

// Export types
export type { User, Session, AuditLogEntry, Invite, Stats, PaginatedResponse };
