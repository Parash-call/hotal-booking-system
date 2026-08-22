const { Server } = require("socket.io");
const { saveMessage } = require("../controllers/chatController");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    const { token } = socket.handshake.auth || {};
    const userId = token ? decodeUserId(token) : null;
    if (userId) socket.join(`user:${userId}`);

    socket.on("register", ({ userId: uid, isAdmin }) => {
      if (uid) socket.join(`user:${uid}`);
      if (isAdmin) socket.join("admins");
    });

    socket.on("chat:user-join", ({ userId: uid }) => {
      socket.join(`chat:${uid}`);
    });

    socket.on("chat:message", async (payload) => {
      try {
        const saved = await saveMessage({
          sender: payload.sender,
          senderName: payload.senderName || "Guest",
          recipient: payload.recipient,
          isAdmin: payload.isAdmin,
          body: payload.body
        });

        const enriched = {
          _id: saved._id,
          sender: saved.sender,
          senderName: saved.senderName,
          recipient: saved.recipient,
          isAdmin: saved.isAdmin,
          body: saved.body,
          createdAt: saved.createdAt
        };

        socket.to("admins").emit("chat:message", enriched);
        socket.to("chat:live").emit("chat:message", enriched);

        if (payload.recipient) {
          socket.to(`chat:${payload.recipient}`).emit("chat:message", enriched);
        }

        if (payload.isAdmin && payload.recipient) {
          socket.to(`user:${payload.recipient}`).emit("chat:message", enriched);
        } else {
          socket.to("admins").emit("chat:new-message", {
            from: payload.sender,
            fromName: payload.senderName,
            body: payload.body,
            createdAt: saved.createdAt
          });
        }
      } catch (err) {
        console.error("chat:message error:", err.message);
      }
    });
  });

  return io;
};

function decodeUserId(token) {
  try {
    const base64 = token.split(".")[1];
    const payload = JSON.parse(Buffer.from(base64, "base64").toString());
    return payload.id;
  } catch {
    return null;
  }
}

const getIO = () => io;

const emitToUser = (userId, event, payload) => {
  if (io && userId) io.to(`user:${userId}`).emit(event, payload);
};

const emitToAdmins = (event, payload) => {
  if (io && io.sockets.adapter.rooms.has("admins")) io.to("admins").emit(event, payload);
};

module.exports = { initSocket, getIO, emitToUser, emitToAdmins };
