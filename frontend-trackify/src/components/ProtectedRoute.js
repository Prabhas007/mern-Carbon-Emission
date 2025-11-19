import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Protects a route — requires authenticated user
 */
export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
