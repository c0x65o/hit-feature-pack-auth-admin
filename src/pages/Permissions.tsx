'use client';

import React, { useState, useMemo } from 'react';
import { Shield, Users, ToggleLeft, ToggleRight, Settings, UserCheck } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import {
  useUsers,
  useRolePagePermissions,
  useUserPageOverrides,
  useUsersWithOverrides,
  usePagePermissionsMutations,
  type User,
} from '../hooks/useAuthAdmin';

interface PermissionsProps {
  onNavigate?: (path: string) => void;
}

// Helper to extract all pages from navigation items
// Excludes admin pages and auth pages
function getAllPages(): Array<{ path: string; label: string }> {
  if (typeof window === 'undefined') return [];
  
  try {
    // Try to get navigation items from the generated nav file
    // This is a dynamic import that may fail if nav hasn't been generated
    const nav = require('@/.hit/generated/nav');
    const navItems = nav.featurePackNav || [];
    
    const pages: Array<{ path: string; label: string }> = [];
    
    // Recursively extract pages from nav items
    function extractPages(items: any[], parentPath = '') {
      for (const item of items) {
        // Skip admin pages and auth pages
        if (item.path?.startsWith('/admin') || item.path?.startsWith('/auth') || item.path?.startsWith('/login')) {
          continue;
        }
        
        // Skip items that require admin role
        if (item.roles && item.roles.includes('admin')) {
          continue;
        }
        
        // Add page if it has a path
        if (item.path && item.path !== '/') {
          pages.push({
            path: item.path,
            label: item.label || item.path,
          });
        }
        
        // Recursively process children
        if (item.children && Array.isArray(item.children)) {
          extractPages(item.children, item.path || '');
        }
      }
    }
    
    extractPages(navItems);
    
    // Also try to get custom nav items
    try {
      const customNav = require('@/lib/custom-nav');
      if (customNav.customNavItems) {
        extractPages(customNav.customNavItems);
      }
    } catch {
      // Custom nav not available
    }
    
    // Remove duplicates
    const uniquePages = Array.from(
      new Map(pages.map((p) => [p.path, p])).values()
    );
    
    return uniquePages.sort((a, b) => a.path.localeCompare(b.path));
  } catch (error) {
    console.warn('Could not load navigation items:', error);
    return [];
  }
}

export function Permissions({ onNavigate }: PermissionsProps) {
  const { Page, Card, Button, Badge, DataTable, Modal, Input, Alert, Spinner, Tabs, Checkbox } = useUi();

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [userOverrideModalOpen, setUserOverrideModalOpen] = useState(false);
  const [selectedUserForOverride, setSelectedUserForOverride] = useState<User | null>(null);

  const { data: usersData, loading: usersLoading } = useUsers({ pageSize: 1000 });
  const { data: rolePermissions, loading: rolePermissionsLoading, refresh: refreshRolePermissions } =
    useRolePagePermissions(selectedRole);
  const { data: userOverrides, loading: userOverridesLoading, refresh: refreshUserOverrides } =
    useUserPageOverrides(selectedUser);
  const { data: usersWithOverrides, loading: usersWithOverridesLoading, refresh: refreshUsersWithOverrides } =
    useUsersWithOverrides();
  const {
    setRolePagePermission,
    deleteRolePagePermission,
    setUserPageOverride,
    deleteUserPageOverride,
    loading: mutating,
  } = usePagePermissionsMutations();

  // Get available roles from auth module configuration
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  React.useEffect(() => {
    // Fetch available roles from auth module /features endpoint
    const fetchRoles = async () => {
      try {
        const authUrl = typeof window !== 'undefined' 
          ? (window as any).NEXT_PUBLIC_HIT_AUTH_URL || '/api/proxy/auth'
          : '/api/proxy/auth';
        const token = typeof window !== 'undefined' ? localStorage.getItem('hit_token') : null;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${authUrl}/features`, { headers });
        if (response.ok) {
          const data = await response.json();
          const roles = data.features?.available_roles || ['admin', 'user'];
          setAvailableRoles(roles);
        } else {
          // Fallback: extract roles from users if API fails
          if (usersData?.items) {
            const roleSet = new Set<string>();
            usersData.items.forEach((user) => {
              const role = user.role || 'user';
              roleSet.add(role);
            });
            setAvailableRoles(Array.from(roleSet).sort());
          } else {
            setAvailableRoles(['admin', 'user']);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch available roles, using fallback:', error);
        // Fallback: extract roles from users
        if (usersData?.items) {
          const roleSet = new Set<string>();
          usersData.items.forEach((user) => {
            const role = user.role || 'user';
            roleSet.add(role);
          });
          setAvailableRoles(Array.from(roleSet).sort());
        } else {
          setAvailableRoles(['admin', 'user']);
        }
      }
    };
    
    fetchRoles();
  }, [usersData]);

  // Use available roles from config, fallback to roles from users
  const roles = useMemo(() => {
    if (availableRoles.length > 0) {
      return availableRoles;
    }
    // Fallback: extract from users if config not loaded yet
    if (usersData?.items) {
      const roleSet = new Set<string>();
      usersData.items.forEach((user) => {
        const role = user.role || 'user';
        roleSet.add(role);
      });
      return Array.from(roleSet).sort();
    }
    return ['admin', 'user']; // Default fallback
  }, [availableRoles, usersData]);

  // Get all pages from navigation (excluding admin pages)
  // For now, we'll use a placeholder - in production this would come from navigation items
  const allPages = useMemo(() => {
    // This should fetch from navigation items, excluding admin pages
    // For now, return empty array - will be populated by user interaction
    return getAllPages();
  }, []);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleRolePermissionToggle = async (pagePath: string, enabled: boolean) => {
    if (!selectedRole) return;
    try {
      if (enabled) {
        await setRolePagePermission(selectedRole, pagePath, true);
      } else {
        // If disabling, create a permission with enabled=false
        await setRolePagePermission(selectedRole, pagePath, false);
      }
      refreshRolePermissions();
    } catch (error) {
      console.error('Failed to update role permission:', error);
    }
  };

  const handleUserOverrideToggle = async (email: string, pagePath: string, enabled: boolean) => {
    try {
      if (enabled) {
        await setUserPageOverride(email, pagePath, true);
      } else {
        await setUserPageOverride(email, pagePath, false);
      }
      refreshUsersWithOverrides();
    } catch (error) {
      console.error('Failed to update user override:', error);
    }
  };

  // Create a map of page paths to enabled status for the selected role
  const rolePermissionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    if (rolePermissions) {
      rolePermissions.forEach((perm) => {
        map.set(perm.page_path, perm.enabled);
      });
    }
    return map;
  }, [rolePermissions]);

  return (
    <Page
      title="Permissions"
      description="Manage page access permissions for roles and users"
    >
      <Tabs
        activeTab={activeTab}
        onChange={(tabId: string) => setActiveTab(tabId as 'roles' | 'users')}
        tabs={[
          {
            id: 'roles',
            label: 'Role Permissions',
            content: (
              <div className="space-y-4 mt-4">
                <Card>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Role</label>
                      <div className="flex gap-2">
                        {roles.map((role) => (
                          <Button
                            key={role}
                            variant={selectedRole === role ? 'primary' : 'ghost'}
                            onClick={() => setSelectedRole(role)}
                          >
                            {role}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {selectedRole && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">
                          Page Permissions for Role: <Badge>{selectedRole}</Badge>
                        </h3>
                        <div className="mb-4">
                          <Alert variant="info">
                            All pages are enabled by default. Toggle off to restrict access for this role.
                          </Alert>
                        </div>

                        {rolePermissionsLoading ? (
                          <Spinner />
                        ) : (
                          <div className="space-y-2">
                            {allPages.length === 0 ? (
                              <Alert variant="warning">
                                No pages found. Pages are discovered from navigation items. Add pages to your feature packs
                                or custom navigation to manage their permissions.
                              </Alert>
                            ) : (
                              allPages.map((page) => {
                                const isEnabled = rolePermissionMap.get(page.path) ?? true; // Default to enabled
                                return (
                                  <div
                                    key={page.path}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                  >
                                    <div>
                                      <div className="font-medium">{page.label || page.path}</div>
                                      <div className="text-sm text-gray-500">{page.path}</div>
                                    </div>
                                    <Checkbox
                                      checked={isEnabled}
                                      onChange={(checked: boolean) => handleRolePermissionToggle(page.path, checked)}
                                      disabled={mutating}
                                    />
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!selectedRole && (
                      <Alert variant="info">Select a role above to manage its page permissions.</Alert>
                    )}
                  </div>
                </Card>
              </div>
            ),
          },
          {
            id: 'users',
            label: 'User Overrides',
            content: (
              <div className="space-y-4 mt-4">
                <Card>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Users with Overrides</h3>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setUserOverrideModalOpen(true);
                        }}
                      >
                        <UserCheck size={16} className="mr-2" />
                        Add User Override
                      </Button>
                    </div>

                    {usersWithOverridesLoading ? (
                      <Spinner />
                    ) : (
                      <DataTable
                        columns={[
                          {
                            key: 'email',
                            label: 'Email',
                            render: (value: unknown) => (
                              <button
                                onClick={() => {
                                  setSelectedUser(value as string);
                                  const user = usersData?.items.find((u) => u.email === value);
                                  if (user) {
                                    setSelectedUserForOverride(user);
                                  }
                                }}
                                className="text-blue-600 hover:underline"
                              >
                                {value as string}
                              </button>
                            ),
                          },
                          {
                            key: 'role',
                            label: 'Role',
                            render: (value: unknown) => <Badge variant="default">{value as string}</Badge>,
                          },
                          {
                            key: 'override_count',
                            label: 'Overrides',
                            render: (value: unknown) => (
                              <Badge variant="info">
                                {(value as number) > 0 ? `${value} override${(value as number) > 1 ? 's' : ''}` : 'None'}
                              </Badge>
                            ),
                          },
                        ]}
                        data={usersWithOverrides || []}
                        emptyMessage="No users with overrides"
                      />
                    )}
                  </div>
                </Card>

                {selectedUser && selectedUserForOverride && (
                  <Card>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          Page Overrides for: <Badge>{selectedUserForOverride.email}</Badge>
                          <span className="ml-2 text-sm text-gray-500">
                            (Role: {selectedUserForOverride.role || 'user'})
                          </span>
                        </h3>
                        <Button variant="ghost" onClick={() => {
                          setSelectedUser('');
                          setSelectedUserForOverride(null);
                        }}>
                          Close
                        </Button>
                      </div>
                      <div className="mb-4">
                        <Alert variant="info">
                          User overrides take precedence over role permissions. Configure specific page access for this user.
                        </Alert>
                      </div>

                      {userOverridesLoading ? (
                        <Spinner />
                      ) : (
                        <div className="space-y-2">
                          {allPages.length === 0 ? (
                            <Alert variant="warning">
                              No pages found. Pages are discovered from navigation items.
                            </Alert>
                          ) : (
                            allPages.map((page) => {
                              const override = userOverrides?.find((o) => o.page_path === page.path);
                              const isEnabled = override ? override.enabled : undefined; // undefined means use role default
                              return (
                                <div
                                  key={page.path}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <div>
                                    <div className="font-medium">{page.label || page.path}</div>
                                    <div className="text-sm text-gray-500">{page.path}</div>
                                    {isEnabled === undefined && (
                                      <div className="text-xs text-gray-400 mt-1">Using role default</div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={isEnabled ?? true}
                                      onChange={(checked: boolean) => handleUserOverrideToggle(selectedUser, page.path, checked)}
                                      disabled={mutating}
                                    />
                                    {isEnabled !== undefined && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                          try {
                                            await deleteUserPageOverride(selectedUser, page.path);
                                            refreshUserOverrides();
                                            refreshUsersWithOverrides();
                                          } catch (error) {
                                            console.error('Failed to delete override:', error);
                                          }
                                        }}
                                      >
                                        Reset
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Add User Override Modal */}
      <Modal
        open={userOverrideModalOpen}
        onClose={() => setUserOverrideModalOpen(false)}
        title="Add User Override"
        description="Select a user to add page-specific overrides"
      >
        <div className="space-y-4">
          {usersLoading ? (
            <Spinner />
          ) : (
            <DataTable
              columns={[
                {
                  key: 'email',
                  label: 'Email',
                  render: (value) => value as string,
                },
                {
                  key: 'role',
                  label: 'Role',
                  render: (value) => <Badge variant="default">{value as string}</Badge>,
                },
              ]}
              data={(usersData?.items || []).map((user) => ({
                email: user.email,
                role: user.role || 'user',
              }))}
              onRowClick={(row) => {
                const user = usersData?.items.find((u) => u.email === row.email);
                if (user) {
                  setSelectedUserForOverride(user);
                  setSelectedUser(user.email);
                  setUserOverrideModalOpen(false);
                  setActiveTab('users');
                }
              }}
              emptyMessage="No users found"
            />
          )}
        </div>
      </Modal>
    </Page>
  );
}

export default Permissions;

