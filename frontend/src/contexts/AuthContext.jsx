import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/api/axios";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
        } catch (err) {
          // Token invalid or expired
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        return res.data.user;
      },
      register: async (formData) => {
        const res = await api.post("/auth/register", formData);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        return res.data.user;
      },
      logout: () => {
        localStorage.removeItem("token");
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
