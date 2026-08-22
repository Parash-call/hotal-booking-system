import { createContext, useContext, useState, useCallback, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

const STORAGE_KEY = "hotel_auth";

const getStored = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStored);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setAuth({ token: data.token, user: data.user });
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (auth.token) await authService.logout(auth.token);
    } catch {
      // ignore
    }
    setAuth({ token: null, user: null });
  }, [auth.token]);

  const setUser = useCallback((user) => {
    setAuth((prev) => ({ ...prev, user }));
  }, []);

  const value = {
    user: auth.user,
    token: auth.token,
    isAuthenticated: !!auth.token,
    isAdmin: auth.user?.role === "admin",
    loading,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
