import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email/username and password",
      });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid login details",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers,
        following: user.following,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};