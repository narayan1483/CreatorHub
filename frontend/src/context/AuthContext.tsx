import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import type {
  UserSummary,
  WorkspaceSummary,
  CreateWorkspacePayload,
} from '../services/apiClient';

export interface CreatorUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  tagline: string;
  avatarUrl: string;
  instagram: string;
  storeUrl: string;
  plan: 'Free Plan' | 'Pro Creator' | 'Agency';
  monthlyRevenue: number;
}

interface AuthContextType {
  user: CreatorUser;
  rawUser: UserSummary | null;
  activeWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, handle: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  switchCreator: (workspaceId: string) => Promise<void>; // Backward-compatibility
  createWorkspace: (payload: CreateWorkspacePayload) => Promise<WorkspaceSummary>;
  refreshWorkspaces: () => Promise<void>;
  allCreators: CreatorUser[]; // Backward-compatibility
}

const DEFAULT_GUEST_CREATOR: CreatorUser = {
  id: 'guest',
  name: 'Creator',
  email: '',
  handle: 'creator',
  tagline: 'Start monetizing with CreatorHub 🚀',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  instagram: 'https://instagram.com/creator',
  storeUrl: 'creatorhub.to/@creator',
  plan: 'Free Plan',
  monthlyRevenue: 0,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapToCreatorUser(user: UserSummary | null, workspace: WorkspaceSummary | null): CreatorUser {
  if (!user && !workspace) return DEFAULT_GUEST_CREATOR;

  const handle = workspace?.slug || 'creator';
  return {
    id: workspace?.id || user?.id || 'usr-1',
    name: user?.fullName || workspace?.name || 'Creator',
    email: user?.email || '',
    handle,
    tagline: workspace?.tagline || 'Welcome to my Creator Store! 🚀',
    avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    instagram: `https://instagram.com/${handle}`,
    storeUrl: `creatorhub.to/@${handle}`,
    plan: 'Free Plan',
    monthlyRevenue: 0,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [rawUser, setRawUser] = useState<UserSummary | null>(() => {
    const saved = localStorage.getItem('creatorhub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceSummary | null>(() => {
    const saved = localStorage.getItem('creatorhub_active_workspace');
    return saved ? JSON.parse(saved) : null;
  });

  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>(() => {
    const saved = localStorage.getItem('creatorhub_workspaces_cache');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!apiClient.getAccessToken();
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize active workspace and user to persistent storage
  useEffect(() => {
    if (activeWorkspace) {
      localStorage.setItem('creatorhub_active_workspace', JSON.stringify(activeWorkspace));
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem('creatorhub_workspaces_cache', JSON.stringify(workspaces));
    }
  }, [workspaces]);

  const refreshWorkspaces = useCallback(async () => {
    if (!apiClient.getAccessToken()) return;
    try {
      const list = await apiClient.getWorkspaces();
      setWorkspaces(list);
      if (list.length > 0) {
        // If active workspace is not set or not in list, pick first
        setActiveWorkspace((prev) => {
          if (!prev || !list.some((w) => w.id === prev.id)) {
            return list[0];
          }
          return prev;
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch workspaces';
      setError(msg);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const token = apiClient.getAccessToken();
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const [me, wsList] = await Promise.all([
          apiClient.getCurrentUser(),
          apiClient.getWorkspaces(),
        ]);

        if (isMounted) {
          setRawUser(me);
          setWorkspaces(wsList);
          setIsAuthenticated(true);

          if (wsList.length > 0) {
            setActiveWorkspace((prev) => {
              if (prev && wsList.some((w) => w.id === prev.id)) return prev;
              return wsList[0];
            });
          }
        }
      } catch {
        // Token might be invalid or expired; clear if refresh fails
        if (isMounted) {
          apiClient.clearSession();
          setRawUser(null);
          setActiveWorkspace(null);
          setWorkspaces([]);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    const handleSessionExpired = () => {
      setRawUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
      setIsAuthenticated(false);
      setError('Session expired. Please log in again.');
    };

    window.addEventListener('creatorhub_session_expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('creatorhub_session_expired', handleSessionExpired);
    };
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await apiClient.login(email, pass);
      setRawUser(session.user);
      setIsAuthenticated(true);

      // Fetch user's workspaces
      const wsList = await apiClient.getWorkspaces();
      setWorkspaces(wsList);

      const defaultWs = session.defaultWorkspace || wsList[0] || null;
      setActiveWorkspace(defaultWs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, handle: string, pass: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await apiClient.register(name, email, pass, handle);
      setRawUser(session.user);
      setIsAuthenticated(true);

      const wsList = await apiClient.getWorkspaces();
      setWorkspaces(wsList);

      const defaultWs = session.defaultWorkspace || wsList[0] || null;
      setActiveWorkspace(defaultWs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your inputs.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } finally {
      apiClient.clearSession();
      setRawUser(null);
      setActiveWorkspace(null);
      setWorkspaces([]);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId: string): Promise<void> => {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (found) {
      setActiveWorkspace(found);
    } else {
      // Re-fetch to ensure fresh membership list
      await refreshWorkspaces();
    }
  };

  const switchCreator = switchWorkspace;

  const createWorkspace = async (payload: CreateWorkspacePayload): Promise<WorkspaceSummary> => {
    const created = await apiClient.createWorkspace(payload);
    setWorkspaces((prev) => [...prev, created]);
    setActiveWorkspace(created);
    return created;
  };

  const currentCreatorUser = mapToCreatorUser(rawUser, activeWorkspace);

  // Map user's workspaces to CreatorUser list for backward-compatible selector dropdowns
  const allCreators: CreatorUser[] = workspaces.length > 0
    ? workspaces.map((ws) => mapToCreatorUser(rawUser, ws))
    : [currentCreatorUser];

  return (
    <AuthContext.Provider
      value={{
        user: currentCreatorUser,
        rawUser,
        activeWorkspace,
        workspaces,
        isAuthenticated,
        isLoading,
        error,
        login,
        signup,
        logout,
        switchWorkspace,
        switchCreator,
        createWorkspace,
        refreshWorkspaces,
        allCreators,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
