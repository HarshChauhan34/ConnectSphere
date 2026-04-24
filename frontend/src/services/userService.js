import api from "./api";

export const getAllUsers = (search = "") => {
  return api.get(`/users?search=${search}`);
};

export const getUserProfile = (userId) => {
  return api.get(`/users/${userId}`);
};

export const updateProfile = (formData) => {
  return api.put("/users/profile/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const followUnfollowUser = (userId) => {
  return api.put(`/users/follow/${userId}`);
};