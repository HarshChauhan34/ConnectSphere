import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getMessagesWithUser,
  sendDirectMessage,
  getUnreadMessagesCount,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/unread-count", protect, getUnreadMessagesCount);
router.get("/:userId", protect, getMessagesWithUser);
router.post("/:userId", protect, sendDirectMessage);

export default router;
