import User from "../models/User.js";
import Notification from "../models/Notification.js";
import sendNotification from "../utils/sendNotification.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { username: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id },
    })
      .select("-password")
      .limit(20);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name username avatar")
      .populate("following", "name username avatar");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({
        username: username.toLowerCase(),
      });

      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }

      user.username = username.toLowerCase();
    }

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "social-media/avatars"
      );

      user.avatar = result.secure_url;
    }

    user.name = name || user.name;
    user.bio = bio ?? user.bio;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        followers: updatedUser.followers,
        following: updatedUser.following,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userToFollow._id.toString() === loggedInUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const alreadyFollowing = loggedInUser.following.some(
      (id) => id.toString() === userToFollow._id.toString()
    );

    if (alreadyFollowing) {
      loggedInUser.following.pull(userToFollow._id);
      userToFollow.followers.pull(loggedInUser._id);

      await loggedInUser.save();
      await userToFollow.save();

      return res.json({
        success: true,
        message: "User unfollowed successfully",
        isFollowing: false,
      });
    }

    loggedInUser.following.push(userToFollow._id);
    userToFollow.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await userToFollow.save();

    const notification = await Notification.create({
      sender: loggedInUser._id,
      receiver: userToFollow._id,
      type: "follow",
      message: `${loggedInUser.name} started following you`,
    });

    const populatedNotification = await notification.populate(
      "sender",
      "name username avatar"
    );

    sendNotification(userToFollow._id, populatedNotification);

    return res.json({
      success: true,
      message: "User followed successfully",
      isFollowing: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};