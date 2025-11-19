import React from "react";
import { Chip } from "@mui/material";
import { ROLES } from "../roles";

export default function RoleBadge({ role }) {
  let label = role;
  if (role === ROLES.ADMIN) label = "Admin";
  else if (role === ROLES.BUSINESS) label = "Business";
  else if (role === ROLES.EMPLOYEE) label = "Employee";
  else label = "User";

  return <Chip label={label} size="small" aria-label={`role-${label}`} />;
}
