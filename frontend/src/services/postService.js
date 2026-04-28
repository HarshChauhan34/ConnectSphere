import api from "./api";

export const createPost = (formData) => {
  return api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getFeedPosts = (page = 1, limit = 10) => {
  return api.get(`/posts/feed?page=${page}&limit=${limit}`);
};

export const getExplorePosts = (page = 1, limit = 12) => {
  return api.get(`/posts/explore?page=${page}&limit=${limit}`);
};

export const getUserPosts = (userId) => {
  return api.get(`/posts/user/${userId}`);
};

export const likeUnlikePost = (postId) => {
  return api.put(`/posts/like/${postId}`);
};

export const updatePost = (postId, postData) => {
  return api.put(`/posts/${postId}`, postData);
};  

export const deletePost = (postId) => {
  return api.delete(`/posts/${postId}`);
};
