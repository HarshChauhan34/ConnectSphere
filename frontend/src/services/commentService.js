import api from "./api";

export const addComment = (postId, data) => {
  return api.post(`/comments/${postId}`, data);
};

export const getPostComments = (postId) => {
  return api.get(`/comments/${postId}`);
};

export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};