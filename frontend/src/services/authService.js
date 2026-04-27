import api from "./api";

export const registerUser = (userData) => {
  return api.post("/auth/register", userData);
};

export const loginUser = (loginData) => {
  return api.post("/auth/login", loginData);
};

export const getMe = () => {
  return api.get("/auth/me");
};

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const resetPassword = (token, password, confirmPassword) => {
  return api.put(`/auth/reset-password/${token}`, { password, confirmPassword });
};
