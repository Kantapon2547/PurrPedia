"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string, refresh: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null,
  login: () => {}, logout: () => {},
  isAdmin: false, isLoggedIn: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("pp_user");
    const storedToken = localStorage.getItem("pp_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("pp_user", JSON.stringify(userData));
    localStorage.setItem("pp_token", accessToken);
    localStorage.setItem("pp_refresh", refreshToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("pp_user");
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_refresh");
  };

  return (
    <AuthContext.Provider value={{
      user, token,
      login, logout,
      isAdmin: user?.role === "admin",
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);