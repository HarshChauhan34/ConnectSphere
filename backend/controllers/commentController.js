import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import sendNotification from "../utils/sendNotification.js";

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text,
    });

    post.commentsCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "name username avatar",
    );

    if (post.user.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        sender: req.user._id,
        receiver: post.user,
        type: "comment",
        post: post._id,
        message: `${req.user.name} commented on your post`,
      });

      const populatedNotification = await notification.populate(
        "sender",
        "name username avatar",
      );

      sendNotification(post.user, populatedNotification);
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
      commentsCount: post.commentsCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await Comment.countDocuments({
      post: req.params.postId,
    });

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own comment",
      });
    }

    const post = await Post.findById(comment.post);

    await comment.deleteOne();

    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
      await post.save();
    }

    res.json({
      success: true,
      message: "Comment deleted successfully",
      commentsCount: post?.commentsCount || 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
