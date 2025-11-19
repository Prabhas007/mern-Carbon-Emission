// src/pages/FootprintForm.js
import React, { useState } from "react";
import { Container, Typography, Grid, TextField, MenuItem, Button, Alert, Paper } from "@mui/material";
import { createFootprint } from "../services/footprint";
import { useNavigate } from "react-router-dom";

const VEHICLE_OPTIONS = [
  { value: "car", label: "Car (Petrol/Diesel)" },
  { value: "bike", label: "Bike" },
  { value: "bus", label: "Bus" },
  { value: "ev", label: "Electric Vehicle (EV)" }
];

const WASTE_OPTIONS = [
  { value: "plastic", label: "Plastic" },
  { value: "organic", label: "Organic (compostable)" },
  { value: "metal", label: "Metal" },
  { value: "other", label: "Other" }
];

export default function FootprintForm() {
  const navigate = useNavigate();
  const [transport, setTransport] = useState({ distanceKm: "", vehicleType: "car", fuelUsed: "" });
  const [energy, setEnergy] = useState({ electricityKwh: "" });
  const [waste, setWaste] = useState({ wasteKg: "", category: "plastic" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateInputs = () => {
    // Ensure numeric fields are numbers >= 0
    const d = Number(transport.distanceKm || 0);
    const f = Number(transport.fuelUsed || 0);
    const e = Number(energy.electricityKwh || 0);
    const w = Number(waste.wasteKg || 0);
    if (isNaN(d) || d < 0) return "Distance must be a number >= 0";
    if (transport.fuelUsed !== "" && (isNaN(f) || f < 0)) return "Fuel used must be >= 0";
    if (isNaN(e) || e < 0) return "Electricity kWh must be >= 0";
    if (isNaN(w) || w < 0) return "Waste weight must be >= 0";
    return null;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    setSuccess("");
    const v = validateInputs();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const payload = {
        transport: {
          distanceKm: Number(transport.distanceKm || 0),
          vehicleType: transport.vehicleType,
          fuelUsed: transport.fuelUsed ? Number(transport.fuelUsed) : 0
        },
        energy: {
          electricityKwh: Number(energy.electricityKwh || 0)
        },
        waste: {
          wasteKg: Number(waste.wasteKg || 0),
          category: waste.category
        }
      };
      const res = await createFootprint(payload);
      setSuccess("Footprint recorded successfully.");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      console.error("submit footprint", err);
      setError(err?.response?.data?.message || "Failed to save footprint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Record Carbon Footprint</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" sx={{ mt: 1 }}>Transportation</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                inputProps={{ min: 0, step: "any" }}
                label="Distance (km)"
                value={transport.distanceKm}
                onChange={(e) => setTransport({ ...transport, distanceKm: e.target.value })}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Vehicle Type"
                value={transport.vehicleType}
                onChange={(e) => setTransport({ ...transport, vehicleType: e.target.value })}
                fullWidth
                required
              >
                {VEHICLE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                inputProps={{ min: 0, step: "any" }}
                label="Fuel used (litres) — optional"
                value={transport.fuelUsed}
                onChange={(e) => setTransport({ ...transport, fuelUsed: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3 }}>Energy Consumption</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                inputProps={{ min: 0, step: "any" }}
                label="Electricity (kWh)"
                value={energy.electricityKwh}
                onChange={(e) => setEnergy({ electricityKwh: e.target.value })}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3 }}>Waste Disposal</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                inputProps={{ min: 0, step: "any" }}
                label="Waste weight (kg)"
                value={waste.wasteKg}
                onChange={(e) => setWaste({ ...waste, wasteKg: e.target.value })}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Waste category"
                value={waste.category}
                onChange={(e) => setWaste({ ...waste, category: e.target.value })}
                fullWidth
                required
              >
                {WASTE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={submitting}>
            {submitting ? "Recording..." : "Record Footprint"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
