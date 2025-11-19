import API from "./api";
import {jwtDecode} from "jwt-decode";

/**
 * Expected backend endpoints:
 * POST /api/auth/register  { name, email, password, role? }
 * POST /api/auth/login     { email, password } -> { token }
 * GET  /api/auth/me        -> { user }
 * POST /api/auth/logout    -> (optional)
 */

export async function register(data) {
  const res = await API.post("http://localhost:5000/api/auth/register", data);
  return res.data;
}

export async function login(credentials) {
  const res = await API.post("http://localhost:5000/api/auth/login", credentials);
  return res.data; // { token }
}

export function saveToken(token) {
  localStorage.setItem("ecotrackify_token", token);
  try {
    const decoded = jwtDecode(token);
    localStorage.setItem("ecotrackify_user", JSON.stringify(decoded));
  } catch (e) {
    // not fatal
    console.warn("Token decode failed", e);
  }
}

export function logout() {
  localStorage.removeItem("ecotrackify_token");
  localStorage.removeItem("ecotrackify_user");
}

export function getUserFromStorage() {
  const raw = localStorage.getItem("ecotrackify_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
