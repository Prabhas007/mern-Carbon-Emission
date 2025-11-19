// src/services/footprint.js
import API from "./api";

/**
 * POST /api/footprints
 * { transport, energy, waste }
 */
export async function createFootprint(payload) {
  const res = await API.post("http://localhost:5000/api/footprints", payload);
  return res.data;
}

export async function getLatestFootprint() {
  const res = await API.get("http://localhost:5000/api/footprints/latest");
  return res.data;
}

export async function getFootprints(page = 0, limit = 10) {
  const res = await API.get(`http://localhost:5000/api/footprints?page=${page}&limit=${limit}`);
  return res.data;
}
