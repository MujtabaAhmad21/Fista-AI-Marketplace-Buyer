"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@/types";
import { api, getAuthToken, clearAuthToken, setAuthToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  cartCount: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cartCount, setCartCount] = useState<number>(0);

  const refreshCartCount = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await api.getCart();
      const count = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
      setCartCount(count);
    } catch {
      // ignore error if unauthorized
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      await refreshCartCount();
    } catch (err) {
      console.warn("Failed to load user session:", err);
      clearAuthToken();
      setUser(null);
      setToken(null);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [refreshCartCount]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { access_token } = await api.login(email, password);
      setToken(access_token);
      const userData = await api.getCurrentUser();
      setUser(userData);
      await refreshCartCount();
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await api.register(fullName, email, password);
      // Automatically log them in after registration
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setToken(null);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        cartCount,
        login,
        signup,
        logout,
        refreshUser,
        refreshCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
