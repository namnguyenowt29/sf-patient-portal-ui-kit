import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchExternalSession } from "../api/authApi";
import { API_ROUTES } from "../authenticationConfig";

interface User {
  readonly id: string;
  readonly name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: (startURL?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await fetchExternalSession();
      setUser(session.user);
    } catch (sessionError) {
      console.error("External-session verification failed", sessionError);
      setUser(null);
      setError("We couldn't verify your session. Please sign in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback((startURL?: string) => {
    const finalLogoutUrl = startURL
      ? `${API_ROUTES.LOGOUT}?startURL=${encodeURIComponent(startURL)}`
      : API_ROUTES.LOGOUT;
    window.location.replace(finalLogoutUrl);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: user !== null, loading, error, checkAuth, logout }),
    [user, loading, error, checkAuth, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
