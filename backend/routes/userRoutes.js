import express from "express";
import {
  getAllUsers,
  getUserProfile,
  updateProfile,
  followUnfollowUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/search", protect, getAllUsers);

router.get("/:id", protect, getUserProfile);
router.put("/profile/update", protect, upload.single("avatar"), updateProfile);
router.put("/follow/:id", protect, followUnfollowUser);

export default router;