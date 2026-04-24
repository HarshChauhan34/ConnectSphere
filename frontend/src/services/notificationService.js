import api from "./api";

export const getNotifications = () => {
  return api.get("/notifications");
};

export const markNotificationsAsRead = () => {
  return api.put("/notifications/read");
};

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};