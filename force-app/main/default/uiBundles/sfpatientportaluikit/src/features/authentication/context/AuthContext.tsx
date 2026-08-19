import { createContext, useState, useEffect, useCallback, type ReactNode, useMemo } from "react";
import { getCurrentUser } from "@salesforce/ui-bundle/api";
import { API_ROUTES } from "../authenticationConfig";

interface User {
  readonly id: string;
  readonly name: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: (startURL?: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Authentication failed", err);
      setError("Authentication failed");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((startURL?: string) => {
    // Navigate to logout URL (server-side endpoint)
    // Use replace to prevent back button from returning to authenticated session
    const finalLogoutUrl = startURL
      ? `${API_ROUTES.LOGOUT}?startURL=${encodeURIComponent(startURL)}`
      : API_ROUTES.LOGOUT;
    window.location.replace(finalLogoutUrl);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((userData) => {
        if (!cancelled) setUser(userData);
      })
      .catch((err) => {
        console.error("Authentication failed", err);
        if (!cancelled) {
          setError("Authentication failed");
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      loading,
      error,
      checkAuth,
      logout,
    }),
    [user, loading, error, checkAuth, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
