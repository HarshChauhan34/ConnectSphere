import Post from "../models/Post.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import sendNotification from "../utils/sendNotification.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    let image = "";

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "social-media/posts",
      );

      image = result.secure_url;
    }

    if (!content && !image) {
      return res.status(400).json({
        success: false,
        message: "Post content or image is required",
      });
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      image,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "name username avatar",
    );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const loggedInUser = await User.findById(req.user._id).select("following");

    const feedUserIds = [...loggedInUser.following, req.user._id];

    const posts = await Post.find({ user: { $in: feedUserIds } })
      .populate("user", "name username avatar")
      .populate("likes", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({
      user: { $in: feedUserIds },
    });

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExplorePosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .populate("user", "name username avatar")
      .populate("likes", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate("user", "name username avatar")
      .populate("likes", "name username avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (alreadyLiked) {
      post.likes.pull(req.user._id);
      await post.save();

      return res.json({
        success: true,
        message: "Post unliked successfully",
        liked: false,
        likesCount: post.likes.length,
      });
    }

    post.likes.push(req.user._id);
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        sender: req.user._id,
        receiver: post.user,
        type: "like",
        post: post._id,
        message: `${req.user.name} liked your post`,
      });

      const populatedNotification = await notification.populate(
        "sender",
        "name username avatar",
      );

      sendNotification(post.user, populatedNotification);
    }

    res.json({
      success: true,
      message: "Post liked successfully",
      liked: true,
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own post",
      });
    }

    const trimmedContent = content?.trim();

    if (!trimmedContent) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    if (trimmedContent.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Post content cannot be more than 1000 characters",
      });
    }

    post.content = trimmedContent;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "name username avatar")
      .populate("likes", "name username avatar");

    res.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own post",
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
