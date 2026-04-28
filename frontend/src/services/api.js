import axios from "axios";

const PROD_API_FALLBACK = "https://connectsphere-8g4j.onrender.com/api";
const DEV_API_FALLBACK = "http://localhost:5000/api";
const isLocalBrowser =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const resolveApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;
  const isLocalApi = configuredUrl?.includes("localhost");

  if (isLocalBrowser) {
    return DEV_API_FALLBACK;
  }

  if (import.meta.env.PROD && isLocalApi) {
    return PROD_API_FALLBACK;
  }

  return (
    configuredUrl ||
    (import.meta.env.PROD ? PROD_API_FALLBACK : DEV_API_FALLBACK)
  );
};

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

api.interceptors.request.use((config) => {
  const user = getStoredUser();

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
    }

    if (error?.code === "ECONNABORTED") {
      error.message = "Request timed out. Please check your connection.";
    } else if (!error?.response) {
      error.message = "Network error. Please try again.";
    }

    return Promise.reject(error);
  },
);

export default api;
