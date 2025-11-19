import React, { useContext, useState } from "react";
import { Container, Typography, TextField, Button, Box, Alert, MenuItem } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import { ROLES } from "../roles";
import { useNavigate } from "react-router-dom";

/**
 * Note: For production, restrict which roles a user can self-register for.
 * Example: Business accounts might require verification.
 */

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.USER);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validate = () => {
    if (!name.trim()) return "Name is required.";
    if (!email.match(/^\S+@\S+\.\S+$/)) return "Invalid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    const payload = { name: name.trim(), email: email.trim(), password, role };
    const res = await register(payload);
    if (res.success) {
      setSuccess("Registration successful. Please check your email for confirmation.");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setError(res.message || "Registration failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Register</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box component="form" onSubmit={handleSubmit} aria-label="register-form" noValidate>
        <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" required />
        <TextField
          select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
          helperText="Choose role (business requires approval—adjust backend)."
          margin="normal"
        >
          <MenuItem value={ROLES.USER}>User</MenuItem>
          <MenuItem value={ROLES.EMPLOYEE}>Employee</MenuItem>
          <MenuItem value={ROLES.BUSINESS}>Business</MenuItem>
        </TextField>

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Register</Button>
      </Box>
    </Container>
  );
}
