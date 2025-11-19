import React, { useContext, useState } from "react";
import { Container, Typography, TextField, Button, Box, Alert } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    const res = await login(email.trim(), password);
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message || "Invalid credentials");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Login to Ecotrackify
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} noValidate aria-label="login-form">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
          inputProps={{ "aria-label": "email" }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          inputProps={{ "aria-label": "password" }}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Login</Button>
        <Button component={RouterLink} to="/register" sx={{ mt: 2, ml: 2 }}>Register</Button>
      </Box>
    </Container>
  );
}
