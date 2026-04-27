import api from "./api";

export const getConversations = () => {
  return api.get("/messages/conversations");
};

export const getUnreadMessagesCount = () => {
  return api.get("/messages/unread-count");
};

export const getMessagesWithUser = (userId) => {
  return api.get(`/messages/${userId}`);
};

export const sendDirectMessage = (userId, text) => {
  return api.post(`/messages/${userId}`, { text });
};
