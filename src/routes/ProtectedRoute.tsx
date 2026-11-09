import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../lib/types";

export default function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: Role;
}) {
  const { isLoggedIn, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4fbfa] flex items-center justify-center text-[#16806d] font-bold">
        Loading Career Compass...
      </div>
    );
  }

  if (!isLoggedIn || !role) {
    return (
      <Navigate
        to={allowedRole === "admin" ? "/portal/access" : "/login"}
        replace
      />
    );
  }

  if (role !== allowedRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}