import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setToken] = useState(null);
  const [refreshToken, setRefresh] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function applyToken(token) {
    setToken(token);
    setAccessToken(token);
  }

  async function login({ email, password }) {
    setLoading(true); setError(null);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      applyToken(res.access_token);
      setRefresh(res.refresh_token || null);
      // persist to sessionStorage
      try {
        sessionStorage.setItem('auth.access_token', res.access_token || '');
        if (res.refresh_token) sessionStorage.setItem('auth.refresh_token', res.refresh_token);
        sessionStorage.setItem('auth.user', JSON.stringify(res.user));
      } catch (_) {}
      return res;
    } catch (e) {
      setError(e.payload?.error?.message || e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function register({ name, email, password }) {
    setLoading(true); setError(null);
    try {
      const res = await api.register({ name, email, password });
      setUser(res.user);
      applyToken(res.access_token);
      setRefresh(res.refresh_token || null);
      // persist to sessionStorage
      try {
        sessionStorage.setItem('auth.access_token', res.access_token || '');
        if (res.refresh_token) sessionStorage.setItem('auth.refresh_token', res.refresh_token);
        sessionStorage.setItem('auth.user', JSON.stringify(res.user));
      } catch (_) {}
      return res;
    } catch (e) {
      setError(e.payload?.error?.message || e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    applyToken(null);
    setRefresh(null);
    try {
      sessionStorage.removeItem('auth.access_token');
      sessionStorage.removeItem('auth.refresh_token');
      sessionStorage.removeItem('auth.user');
    } catch (_) {}
  }

  // Handle token refresh
  useEffect(() => {
    if (!refreshToken) {
      api.setUnauthorizedHandler(null);
      return;
    }

    let refreshingPromise = null;

    api.setUnauthorizedHandler(async () => {
      if (refreshingPromise) return refreshingPromise;

      refreshingPromise = (async () => {
        try {
          const res = await api.refresh({ refresh_token: refreshToken });
          const newAccess = res.access_token;
          applyToken(newAccess);
          try {
            sessionStorage.setItem('auth.access_token', newAccess);
          } catch (_) {}
          return newAccess;
        } catch (err) {
          logout();
          throw err;
        } finally {
          refreshingPromise = null;
        }
      })();

      return refreshingPromise;
    });

    return () => api.setUnauthorizedHandler(null);
  }, [refreshToken]);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const token = sessionStorage.getItem('auth.access_token');
      const userJson = sessionStorage.getItem('auth.user');
      const refresh = sessionStorage.getItem('auth.refresh_token');
      if (token) {
        applyToken(token);
        setRefresh(refresh || null);
        if (userJson) {
          try { setUser(JSON.parse(userJson)); } catch { }
        } else {
          api.me().then((u) => setUser({ id: u.id, name: u.name, email: u.email }))
            .catch(() => {  });
        }
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    login,
    register,
    logout,
  }), [user, accessToken, refreshToken, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
