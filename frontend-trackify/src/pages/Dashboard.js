// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import { Container, Typography, Paper, Box, Grid, Button, CircularProgress } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import { ROLES } from "../roles";
import { Link as RouterLink } from "react-router-dom";
import { getLatestFootprint } from "../services/footprint";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2e7d32","#ff9800","#8e24aa"]; // transport, energy, waste

function Tips({ highestSource }) {
  // Basic tips by source
  const tips = {
    transport: [
      "Use public transport whenever possible.",
      "Carpool with colleagues or friends.",
      "Maintain your vehicle (tyre pressure, tune-ups).",
      "Consider switching to an EV where feasible."
    ],
    energy: [
      "Switch to LED lights and energy-efficient appliances.",
      "Turn off appliances when not in use.",
      "Lower AC usage — use fans where possible.",
      "Unplug chargers and idle electronics."
    ],
    waste: [
      "Reduce single-use plastics and re-use containers.",
      "Start composting organic waste.",
      "Recycle materials (plastics, metals) properly.",
      "Avoid unnecessary packaging when shopping."
    ],
    none: ["All good — no dominant source yet. Keep tracking!"]
  };

  const list = tips[highestSource] || tips.none;
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Tips to reduce {highestSource || "footprint"}</Typography>
      <Box component="ul" sx={{ pl: 3, m: 0 }}>
        {list.map((t, i) => <li key={i}><Typography variant="body2">{t}</Typography></li>)}
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const { user, isInRole } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [footprint, setFootprint] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const res = await getLatestFootprint();
        if (mounted) {
          setFootprint(res);
        }
      } catch (err) {
        // ignore 404 (no data)
        if (err?.response?.status === 404) {
          setFootprint(null);
        } else {
          console.error("fetch latest footprint", err);
          setError("Failed to load footprint");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLatest();
    return () => { mounted = false; };
  }, []);

  const renderCards = () => {
    if (!footprint) return (
      <Paper sx={{ p: 2 }}>
        <Typography>No footprint data found. Record your footprint to see insights.</Typography>
        <Button component={RouterLink} to="/footprint" variant="contained" sx={{ mt: 2 }}>Record Footprint</Button>
      </Paper>
    );

    const transport = footprint.transport?.co2 || 0;
    const energy = footprint.energy?.co2 || 0;
    const waste = footprint.waste?.co2 || 0;
    const total = footprint?.totalCO2 || (transport + energy + waste);

    // determine highest source
    const entries = [
      { name: "transport", value: transport },
      { name: "energy", value: energy },
      { name: "waste", value: waste }
    ];
    const highest = entries.reduce((a,b) => (b.value > a.value ? b : a), entries[0]).value > 0 ? entries.reduce((a,b) => (b.value > a.value ? b : a), entries[0]).name : null;

    const pieData = [
      { name: "Transport", value: transport },
      { name: "Energy", value: energy },
      { name: "Waste", value: waste }
    ];

    return (
      <>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Transportation</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>{transport} kg CO₂</Typography>
              <Typography variant="body2">Distance: {footprint.transport?.distanceKm ?? 0} km</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Energy</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>{energy} kg CO₂</Typography>
              <Typography variant="body2">Electricity: {footprint.energy?.electricityKwh ?? 0} kWh</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Waste</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>{waste} kg CO₂</Typography>
              <Typography variant="body2">Waste: {footprint.waste?.wasteKg ?? 0} kg</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6">Total Emissions</Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>{total} kg CO₂</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Tips highestSource={highest} />
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Welcome back, {user?.name || user?.email}
      </Typography>

      {loading ? <CircularProgress /> : renderCards()}
      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}
