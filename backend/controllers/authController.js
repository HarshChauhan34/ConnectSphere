import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const PASSWORD_RESET_EXPIRY_MS = 15 * 60 * 1000;

const getClientResetUrl = (token) => {
  const clientBaseUrl = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

  return `${clientBaseUrl}/reset-password/${token}`;
};

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordResetToken +passwordResetExpires",
    );

    // Return a generic success message to avoid leaking user existence.
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = Date.now() + PASSWORD_RESET_EXPIRY_MS;
    await user.save({ validateBeforeSave: false });

    const resetUrl = getClientResetUrl(resetToken);
    const messageText = `You requested a password reset for your ConnectSphere account.\n\nUse this link (valid for 15 minutes): ${resetUrl}\n\nIf you did not request this, you can ignore this email.`;
    const messageHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your ConnectSphere password</h2>
        <p>You requested a password reset for your account.</p>
        <p>
          This link is valid for <strong>15 minutes</strong>:
        </p>
        <p>
          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a>
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "ConnectSphere Password Reset",
        text: messageText,
        html: messageHtml,
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: emailError.message || "Unable to send reset email",
      });
    }

    return res.json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter password and confirm password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful. Please login.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
