import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      receiver: req.user._id,
    })
      .populate("sender", "name username avatar")
      .populate("post", "content image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({
      receiver: req.user._id,
    });

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};