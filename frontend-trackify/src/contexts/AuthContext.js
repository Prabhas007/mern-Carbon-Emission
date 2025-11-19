import React, { createContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, saveToken, getUserFromStorage } from "../services/auth";
import API from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUserFromStorage());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally: check token validity with backend /auth/me
    // We'll skip heavy checks to keep frontend responsive.
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin({ email, password });
      if (data && data.token) {
        saveToken(data.token);
        // read saved user
        const u = getUserFromStorage();
        setUser(u);
      }
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.message || err.message || "Login failed";
      return { success: false, message: msg };
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      await API.post("http://localhost:5000/api/auth/register", payload);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err?.response?.data?.message || err.message };
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const isInRole = (role) => {
    if (!user) return false;
    // backend may put roles as array in token as role or roles
    const roles = user.roles || (user.role ? [user.role] : []);
    return roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isInRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
