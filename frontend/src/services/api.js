import axios from "axios";

const PROD_API_FALLBACK = "https://localhost:5000/api";
const DEV_API_FALLBACK = "http://localhost:5000/api";
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_API_FALLBACK : DEV_API_FALLBACK);

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default api;
