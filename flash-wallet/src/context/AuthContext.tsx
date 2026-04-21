"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User } from "@/types";
import {
  authApi,
  clearAuth,
  getStoredUser,
  getStoredToken,
  setAuthToken,
  setStagingUserId,
  setUserCookie,
} from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session au montage
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Login via email/password
  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (!res.success) {
      throw new Error(res.message || "Échec de la connexion");
    }

    // Le token est dans res.data.token selon la doc officielle Flash
    const jwt = res.data?.token || res.data?.access_token;
    const usr = res.data?.user;

    if (jwt && typeof jwt === "string") {
      setAuthToken(jwt);
      setToken(jwt);
    }

    if (usr) {
      setStagingUserId(usr.id);
      setUserCookie(usr);
      setUserState(usr);
    }
  }, []);

  // Login direct avec un token + user (pour auto-login post-OTP)
  const loginWithToken = useCallback((t: string, u: User) => {
    setAuthToken(t);
    setStagingUserId(u.id);
    setUserCookie(u);
    setToken(t);
    setUserState(u);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignorer les erreurs réseau au logout
    } finally {
      clearAuth();
      setUserState(null);
      setToken(null);
    }
  }, []);

  // Mettre à jour l'utilisateur
  const setUser = useCallback((u: User) => {
    setUserState(u);
    setUserCookie(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!(token || typeof window !== "undefined"),
        login,
        loginWithToken,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
