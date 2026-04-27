import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import sendMessage from "../utils/sendMessage.js";

const buildConversationKey = (firstUserId, secondUserId) => {
  return [firstUserId.toString(), secondUserId.toString()].sort().join(":");
};

const getOrCreateConversation = async (firstUserId, secondUserId) => {
  const conversationKey = buildConversationKey(firstUserId, secondUserId);

  let conversation = await Conversation.findOne({ conversationKey });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [firstUserId, secondUserId],
      conversationKey,
      lastMessageAt: new Date(),
    });
  }

  return conversation;
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name username avatar")
      .sort({ lastMessageAt: -1 });

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUser = conversation.participants.find(
          (participant) => participant._id.toString() !== userId.toString(),
        );

        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          receiver: userId,
          seen: false,
        });

        return {
          _id: conversation._id,
          otherUser,
          lastMessage: conversation.lastMessage || "",
          lastMessageAt: conversation.lastMessageAt,
          unreadCount,
        };
      }),
    );

    return res.json({
      success: true,
      conversations: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessagesWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const otherUser = await User.findById(otherUserId).select(
      "_id name username avatar",
    );

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const conversationKey = buildConversationKey(currentUserId, otherUserId);
    const conversation = await Conversation.findOne({ conversationKey });

    if (!conversation) {
      return res.json({
        success: true,
        conversationId: null,
        otherUser,
        messages: [],
      });
    }

    const messages = await Message.find({
      conversation: conversation._id,
    })
      .populate("sender", "_id name username avatar")
      .populate("receiver", "_id name username avatar")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversation: conversation._id,
        receiver: currentUserId,
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      },
    );

    return res.json({
      success: true,
      conversationId: conversation._id,
      otherUser,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendDirectMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;
    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself",
      });
    }

    const receiver = await User.findById(receiverId).select("_id");

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const conversation = await getOrCreateConversation(senderId, receiverId);

    const createdMessage = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      text,
    });

    conversation.lastMessage = text;
    conversation.lastMessageAt = createdMessage.createdAt;
    conversation.lastMessageSender = senderId;
    await conversation.save();

    const message = await Message.findById(createdMessage._id)
      .populate("sender", "_id name username avatar")
      .populate("receiver", "_id name username avatar");

    sendMessage(receiverId, message);

    return res.status(201).json({
      success: true,
      message: "Message sent",
      conversationId: conversation._id,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadMessagesCount = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      seen: false,
    });

    return res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
