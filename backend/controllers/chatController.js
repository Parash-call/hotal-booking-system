const ChatMessage = require("../models/ChatMessage");
const Notification = require("../models/Notification");

const getMessages = async (req, res) => {
  try {
    const { with: otherUserId } = req.query;
    const filter = {};

    if (req.user.role === "admin") {
      if (otherUserId) {
        filter.$or = [
          { sender: otherUserId, recipient: req.user._id },
          { sender: req.user._id, recipient: otherUserId },
          { sender: otherUserId, isAdmin: true }
        ];
      }
    } else {
      filter.$or = [{ sender: req.user._id }, { recipient: req.user._id }, { isAdmin: true, sender: req.user._id }];
    }

    const messages = await ChatMessage.find(filter).sort({ createdAt: 1 }).limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: -1 });
    const byUser = {};
    messages.forEach((m) => {
      const key = m.isAdmin ? (m.sender?.toString() || "guest") : (m.sender?.toString() || "guest");
      if (!byUser[key]) byUser[key] = { userId: key, senderName: m.senderName || "Guest", lastMessage: m.body, lastAt: m.createdAt };
    });
    res.json(Object.values(byUser).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const saveMessage = async ({ sender, senderName, recipient, isAdmin, body }) => {
  const message = await ChatMessage.create({ sender, senderName, recipient, isAdmin, body });
  return message;
};

module.exports = { getMessages, getConversations, saveMessage };
