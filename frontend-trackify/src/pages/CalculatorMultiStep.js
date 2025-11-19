// src/pages/CalculatorMultiStep.js
import React, { useState } from "react";
import {
  Container, Typography, Stepper, Step, StepLabel, Paper, Box,
  Grid, TextField, MenuItem, Button, Slider, FormControl, InputLabel, Select, Switch, FormControlLabel, Alert
} from "@mui/material";
import { createFootprint } from "../services/footprint";
import { useNavigate } from "react-router-dom";

const steps = ["Personal", "Travel", "Waste", "Energy", "Consumption", "Review & Calculate"];

// helpers for inputs
const dietOptions = ["omnivore", "vegetarian", "vegan", "pescetarian"];
const genderOptions = ["male", "female", "other"];
const transportOptions = ["car", "bike", "motorbike", "public", "walking", "ev"];
const flightOptions = ["never", "once", "twice", "frequently"];
const wasteBagOptions = ["small", "medium", "large"];
const recyclingOptions = ["paper", "plastic", "glass", "metal", "none"];
const heatingOptions = ["natural gas", "electricity", "wood", "LPG"];
const cookingOptions = ["gas stove", "induction", "electric coil", "microwave"];
const showerOptions = ["daily", "weekly", "monthly"];

function valuetext(v) { return `${v}`; }

export default function CalculatorMultiStep() {
  const navigate = useNavigate();

  // state: group by category
  const [personal, setPersonal] = useState({
    height: 170, weight: 65, gender: "other", diet: "omnivore", socialActivity: "weekly"
  });

  const [travel, setTravel] = useState({
    transportMode: "car", monthlyDistance: 100, flightFreq: "never"
  });

  const [waste, setWaste] = useState({
    bagSize: "medium", bagsPerWeek: 2, recycling: "plastic"
  });

  const [energy, setEnergy] = useState({
    heatingSource: "electricity", cookingSystem: "gas stove",
    energyAware: false, pcTvDaily: 3, internetDaily: 4
  });

  const [consumption, setConsumption] = useState({
    showerFreq: "daily", grocerySpending: 100, clothesPerMonth: 2
  });

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // basic validation per-step
  const validateStep = (step) => {
    setError("");
    if (step === 0) {
      if (!personal.height || personal.height <= 0) return "Height must be > 0";
      if (!personal.weight || personal.weight <= 0) return "Weight must be > 0";
      if (!dietOptions.includes(personal.diet)) return "Invalid diet";
    }
    if (step === 1) {
      if (!transportOptions.includes(travel.transportMode)) return "Select transport";
      if (isNaN(travel.monthlyDistance) || travel.monthlyDistance < 0) return "Distance must be >= 0";
    }
    if (step === 2) {
      if (!wasteBagOptions.includes(waste.bagSize)) return "Select bag size";
      if (isNaN(waste.bagsPerWeek) || waste.bagsPerWeek < 0) return "Bags per week must be >= 0";
    }
    if (step === 3) {
      if (!heatingOptions.includes(energy.heatingSource)) return "Select heating source";
      if (isNaN(energy.pcTvDaily) || energy.pcTvDaily < 0) return "PC/TV hours invalid";
    }
    if (step === 4) {
      if (!showerOptions.includes(consumption.showerFreq)) return "Select shower frequency";
    }
    return null;
  };

  const handleNext = () => {
    const v = validateStep(activeStep);
    if (v) { setError(v); return; }
    setActiveStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const handleBack = () => { setError(""); setActiveStep((s) => Math.max(0, s - 1)); };

  // Build payload the backend expects: grouping inputs
  const buildPayload = () => {
    return {
      personal: {
        height: Number(personal.height),
        weight: Number(personal.weight),
        gender: personal.gender,
        diet: personal.diet,
        socialActivity: personal.socialActivity
      },
      travel: {
        transportMode: travel.transportMode,
        monthlyDistanceKm: Number(travel.monthlyDistance),
        flightFrequency: travel.flightFreq
      },
      waste: {
        bagSize: waste.bagSize,
        bagsPerWeek: Number(waste.bagsPerWeek),
        recycling: waste.recycling
      },
      energy: {
        heatingSource: energy.heatingSource,
        cookingSystem: energy.cookingSystem,
        energyAware: !!energy.energyAware,
        pcTvDaily: Number(energy.pcTvDaily),
        internetDaily: Number(energy.internetDaily)
      },
      consumption: {
        showerFreq: consumption.showerFreq,
        grocerySpending: Number(consumption.grocerySpending),
        clothesPerMonth: Number(consumption.clothesPerMonth)
      }
    };
  };

  // Submit to backend
  const handleCalculate = async () => {
    setError("");
    const v = validateStep(activeStep);
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const payload = buildPayload();
      // createFootprint will POST to /api/footprints and expects any structure (we implemented backend accordingly)
      await createFootprint(payload);
      // redirect to dashboard where latest footprint is shown
      navigate("/dashboard");
    } catch (err) {
      console.error("calc error", err);
      setError(err?.response?.data?.message || "Calculation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // UI per step
  const StepContent = ({ step }) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField label="Height (cm)" type="number" inputProps={{ min: 0 }}
                value={personal.height} onChange={(e) => setPersonal({ ...personal, height: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Weight (kg)" type="number" inputProps={{ min: 0 }}
                value={personal.weight} onChange={(e) => setPersonal({ ...personal, weight: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select label="Gender" value={personal.gender}
                onChange={(e) => setPersonal({ ...personal, gender: e.target.value })} fullWidth>
                {genderOptions.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select label="Diet type" value={personal.diet}
                onChange={(e) => setPersonal({ ...personal, diet: e.target.value })} fullWidth>
                {dietOptions.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Social activity" value={personal.socialActivity}
                onChange={(e) => setPersonal({ ...personal, socialActivity: e.target.value })} fullWidth>
                {["never","rarely","weekly","daily"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Mode of transport" value={travel.transportMode}
                onChange={(e) => setTravel({ ...travel, transportMode: e.target.value })} fullWidth>
                {transportOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Monthly distance traveled: {travel.monthlyDistance} km</Typography>
              <Slider
                value={travel.monthlyDistance}
                onChange={(e, v) => setTravel({ ...travel, monthlyDistance: v })}
                min={0} max={5000} valueLabelDisplay="auto" getAriaValueText={valuetext}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select label="Flight frequency per month" value={travel.flightFreq}
                onChange={(e) => setTravel({ ...travel, flightFreq: e.target.value })} fullWidth>
                {flightOptions.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Waste bag size" value={waste.bagSize}
                onChange={(e) => setWaste({ ...waste, bagSize: e.target.value })} fullWidth>
                {wasteBagOptions.map(wb => <MenuItem key={wb} value={wb}>{wb}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Number of waste bags per week: {waste.bagsPerWeek}</Typography>
              <Slider value={waste.bagsPerWeek} onChange={(e, v) => setWaste({ ...waste, bagsPerWeek: v })}
                min={0} max={10} step={1} valueLabelDisplay="auto" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select label="Recycling habits" value={waste.recycling}
                onChange={(e) => setWaste({ ...waste, recycling: e.target.value })} fullWidth>
                {recyclingOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Main heating power source" value={energy.heatingSource}
                onChange={(e) => setEnergy({ ...energy, heatingSource: e.target.value })} fullWidth>
                {heatingOptions.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Cooking system" value={energy.cookingSystem}
                onChange={(e) => setEnergy({ ...energy, cookingSystem: e.target.value })} fullWidth>
                {cookingOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={energy.energyAware} onChange={(e) => setEnergy({ ...energy, energyAware: e.target.checked })} />} label="Energy efficiency awareness" />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Daily PC/TV screen time (hrs): {energy.pcTvDaily}</Typography>
              <Slider value={energy.pcTvDaily} onChange={(e, v) => setEnergy({ ...energy, pcTvDaily: v })} min={0} max={24} valueLabelDisplay="auto" />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Daily Internet usage (hrs): {energy.internetDaily}</Typography>
              <Slider value={energy.internetDaily} onChange={(e, v) => setEnergy({ ...energy, internetDaily: v })} min={0} max={24} valueLabelDisplay="auto" />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField select label="Shower frequency" value={consumption.showerFreq}
                onChange={(e) => setConsumption({ ...consumption, showerFreq: e.target.value })} fullWidth>
                {showerOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Monthly grocery spending ($): {consumption.grocerySpending}</Typography>
              <Slider value={consumption.grocerySpending} onChange={(e, v) => setConsumption({ ...consumption, grocerySpending: v })}
                min={0} max={500} valueLabelDisplay="auto" />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Number of clothes bought per month: {consumption.clothesPerMonth}</Typography>
              <Slider value={consumption.clothesPerMonth} onChange={(e, v) => setConsumption({ ...consumption, clothesPerMonth: v })}
                min={0} max={30} valueLabelDisplay="auto" />
            </Grid>
          </Grid>
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6">Review your inputs</Typography>
            <Paper sx={{ p: 2, mt: 1 }}>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify({ personal, travel, waste, energy, consumption }, null, 2)}</pre>
            </Paper>
            <Typography variant="body2" sx={{ mt: 2 }}>Click Calculate Carbon Footprint to save and compute emissions.</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>e-Carbon Emission Calculator</Typography>
      <Paper sx={{ p: 2 }}>
        <Stepper activeStep={activeStep} sx={{ pb: 2 }} alternativeLabel>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <StepContent step={activeStep} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>Next</Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleCalculate} disabled={submitting}>
              {submitting ? "Calculating..." : "Calculate Carbon Footprint"}
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
