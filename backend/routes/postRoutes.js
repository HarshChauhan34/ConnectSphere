import express from "express";
import {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getUserPosts,
  likeUnlikePost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createPost);
router.get("/feed", protect, getFeedPosts);
router.get("/explore", protect, getExplorePosts);
router.get("/user/:id", protect, getUserPosts);
router.put("/like/:id", protect, likeUnlikePost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
