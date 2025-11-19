import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api", // set via .env or default '/api'
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

// attach token interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecotrackify_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
