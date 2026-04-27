import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const PASSWORD_RESET_EXPIRY_MS = 15 * 60 * 1000;
const PASSWORD_RESET_EXPIRY_MINUTES = PASSWORD_RESET_EXPIRY_MS / (60 * 1000);

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
    const appName = "ConnectSphere";
    const supportEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const messageText = [
      `${appName} Password Reset`,
      "",
      "We received a request to reset your password.",
      "",
      `Reset link (valid for ${PASSWORD_RESET_EXPIRY_MINUTES} minutes):`,
      resetUrl,
      "",
      "If the button does not work, copy and paste the link into your browser.",
      "",
      "If you did not request this, you can safely ignore this email.",
      supportEmail ? `Need help? Contact: ${supportEmail}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const messageHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${appName} Password Reset</title>
        </head>
        <body style="margin:0;padding:0;background:#0b0f14;color:#111827;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0b0f14;padding:28px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:22px 24px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#dbeafe;">${appName}</p>
                      <h1 style="margin:8px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.3;color:#ffffff;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px;">
                      <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;">
                        We received a request to reset your ${appName} password.
                      </p>
                      <p style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;">
                        This link is valid for <strong>${PASSWORD_RESET_EXPIRY_MINUTES} minutes</strong>.
                      </p>

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
                        <tr>
                          <td align="center" style="border-radius:10px;background:#2563eb;">
                            <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4b5563;">
                        If the button does not work, copy and paste this URL into your browser:
                      </p>
                      <p style="margin:0 0 18px 0;word-break:break-all;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#1d4ed8;">
                        <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="color:#1d4ed8;text-decoration:underline;">${resetUrl}</a>
                      </p>

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;border-radius:10px;">
                        <tr>
                          <td style="padding:12px 14px;">
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#4b5563;">
                              If you did not request this reset, you can safely ignore this email. Your current password will remain unchanged.
                            </p>
                          </td>
                        </tr>
                      </table>

                      ${
                        supportEmail
                          ? `<p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">Need help? Reply to this email or contact <a href="mailto:${supportEmail}" style="color:#2563eb;">${supportEmail}</a>.</p>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: `${appName} | Password Reset Request`,
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
