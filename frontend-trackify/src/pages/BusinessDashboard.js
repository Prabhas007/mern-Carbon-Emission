import React from "react";
import { Container, Typography, Paper, Box } from "@mui/material";

/**
 * This route should be protected by RoleRoute allowing only business and admin.
 */
export default function BusinessDashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4">Business Dashboard</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6">Company Metrics</Typography>
        <Typography variant="body2">Aggregate employee footprints, resource recommendations, and exportable reports.</Typography>

        <Box sx={{ mt: 2 }}>
          {/* Implement charts and employee-list with proper permissions */}
        </Box>
      </Paper>
    </Container>
  );
}
