'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load credentials from local storage on mount
    const storedToken = localStorage.getItem('nova_auth_token');
    const storedUser = localStorage.getItem('nova_auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('nova_auth_token', data.token);
      localStorage.setItem('nova_auth_user', JSON.stringify(data.user));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setIsLoading(false);
        return false;
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('nova_auth_token', data.token);
      localStorage.setItem('nova_auth_user', JSON.stringify(data.user));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nova_auth_token');
    localStorage.removeItem('nova_auth_user');
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        signup,
        logout,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
