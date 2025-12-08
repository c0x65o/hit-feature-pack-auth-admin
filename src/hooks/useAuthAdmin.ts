/**
 * Auth Admin API hooks
 */

import { useState, useEffect, useCallback } from 'react';

interface User {
  email: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  roles: string[];
  created_at: string;
  last_login: string | null;
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

async function fetchWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const authUrl = getAuthUrl();
  const url = `${authUrl}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
      const data = await fetchWithAuth<Stats>('/admin/stats');
      setStats(data);
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

  const { page = 1, pageSize = 25, search, sortBy, sortOrder } = options;

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (search) params.set('search', search);
      if (sortBy) params.set('sort_by', sortBy);
      if (sortOrder) params.set('sort_order', sortOrder);

      const result = await fetchWithAuth<PaginatedResponse<User>>(`/admin/users?${params}`);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder]);

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
      const data = await fetchWithAuth<User>(`/admin/users/${encodeURIComponent(email)}`);
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
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (search) params.set('search', search);

      const result = await fetchWithAuth<PaginatedResponse<Session>>(`/admin/sessions?${params}`);
      setData(result);
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
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });
      if (search) params.set('search', search);

      const result = await fetchWithAuth<PaginatedResponse<AuditLogEntry>>(`/admin/audit-log?${params}`);
      setData(result);
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
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });

      const result = await fetchWithAuth<PaginatedResponse<Invite>>(`/admin/invites?${params}`);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
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
      await fetchWithAuth('/admin/users', {
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
      await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}`, {
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
      await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/reset-password`, {
        method: 'POST',
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
      await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/roles`, {
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
      await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/lock`, {
        method: 'POST',
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
      await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/unlock`, {
        method: 'POST',
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
      await fetchWithAuth(`/admin/sessions/${sessionId}`, {
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
      await fetchWithAuth(`/admin/users/${encodeURIComponent(email)}/sessions`, {
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
      await fetchWithAuth('/admin/invites', {
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
      await fetchWithAuth(`/admin/invites/${inviteId}/resend`, {
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
      await fetchWithAuth(`/admin/invites/${inviteId}`, {
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
