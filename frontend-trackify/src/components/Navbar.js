import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import RoleBadge from "./RoleBadge";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const roles = user?.roles || (user?.role ? [user.role] : []);

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ color: "inherit", textDecoration: "none", flexGrow: 1 }}>
          Ecotrackify
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user ? (
            <>
              <Typography variant="body2" aria-live="polite">Hi, {user.name || user.email}</Typography>
              {roles.map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
              <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
              <Button color="inherit" component={RouterLink} to="/footprint">Record Footprint</Button>
              <Button color="inherit" component={RouterLink} to="/tips">Tips</Button>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
