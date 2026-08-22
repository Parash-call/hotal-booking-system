const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = notifications.filter((n) => !n.read).length;
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNotification = async (user, { title, body, type = "info", target }) => {
  if (!user) return null;
  try {
    const notification = await Notification.create({ user, title, body, type, target });
    return notification;
  } catch (err) {
    console.error("Notification create failed:", err.message);
    return null;
  }
};

module.exports = { getMyNotifications, markAllRead, markRead, createNotification };
