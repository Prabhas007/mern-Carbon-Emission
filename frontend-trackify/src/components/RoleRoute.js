import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

/**
 * RoleRoute: accepts allowedRoles array
 * Example: <RoleRoute allowedRoles={[ROLES.BUSINESS, ROLES.ADMIN]}> ... </RoleRoute>
 */
export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roles = user.roles || (user.role ? [user.role] : []);
  const permitted = roles.some((r) => allowedRoles.includes(r));
  if (!permitted) {
    // Optionally redirect to a "Not Authorized" page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
