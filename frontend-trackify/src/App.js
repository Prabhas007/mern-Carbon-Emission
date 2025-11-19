import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import AdminPanel from "./pages/AdminPanel";
import TipsFeed from "./pages/TipsFeed";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import CalculatorMultiStep from "./pages/CalculatorMultiStep";
import FootprintForm from "./pages/FootprintForm";
import { ROLES } from "./roles";
import { Container, Typography } from "@mui/material";

function Unauthorized() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4">Unauthorized</Typography>
      <Typography variant="body1">You do not have permission to view this page.</Typography>
    </Container>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/calculator" element={
            <ProtectedRoute>
              <CalculatorMultiStep />
            </ProtectedRoute>
          } />

          <Route path="/footprint" element={
            <ProtectedRoute>
              <FootprintForm />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/tips" element={
            <ProtectedRoute>
              <TipsFeed />
            </ProtectedRoute>
          } />

          <Route path="/business" element={
            <RoleRoute allowedRoles={[ROLES.BUSINESS, ROLES.ADMIN]}>
              <BusinessDashboard />
            </RoleRoute>
          } />

          <Route path="/admin" element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminPanel />
            </RoleRoute>
          } />

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
