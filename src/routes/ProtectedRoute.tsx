import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: "student" | "admin";
}) {
  const { isLoggedIn, role } = useAuth();

  if (!isLoggedIn || !role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return role === "admin" ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  return children;
}