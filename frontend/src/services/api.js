import axios from "axios";

const PROD_API_FALLBACK = "https://connectsphere-8g4j.onrender.com/api";
const DEV_API_FALLBACK = "http://localhost:5000/api";
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_API_FALLBACK : DEV_API_FALLBACK);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  let user;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = undefined;
  }

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default api;
