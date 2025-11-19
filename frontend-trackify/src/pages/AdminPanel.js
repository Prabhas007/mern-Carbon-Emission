import React from "react";
import { Container, Typography, Paper } from "@mui/material";

/**
 * Admin-only view: moderate tips and manage users/business accounts.
 */
export default function AdminPanel() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4">System Admin Panel</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body1">Moderation, user management, system logs, and configuration.</Typography>
      </Paper>
    </Container>
  );
}
