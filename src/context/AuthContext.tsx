import { createContext, useContext, useState } from "react";

type Role = "student" | "admin" | null;

type AuthContextType = {
  isLoggedIn: boolean;
  role: Role;
  login: (role: "student" | "admin") => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    const savedRole = localStorage.getItem("role");

    if (savedRole === "student" || savedRole === "admin") {
      return savedRole;
    }

    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("isLoggedIn") === "true" && role !== null;
  });

  const login = (selectedRole: "student" | "admin") => {
    localStorage.clear();

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", selectedRole);

    setRole(selectedRole);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.clear();

    setRole(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}