import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import notificationService from "../services/notificationService";

const SocketContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const SOCKET_URL = API_BASE_URL.startsWith("http")
  ? API_BASE_URL.replace(/\/api\/?$/, "")
  : window.location.origin;

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatPartner, setChatPartner] = useState(null);

  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationService.getMyNotifications(token);
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return;
    }

    if (socketRef.current) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("register", { userId: user?._id || user?.id, isAdmin: user?.role === "admin" });
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("notification:new", () => refreshNotifications());
    socket.on("booking:updated", () => refreshNotifications());
    socket.on("payment:completed", () => refreshNotifications());
    socket.on("booking:cancelled", () => refreshNotifications());

    socket.on("chat:message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, refreshNotifications]);

  const sendChatMessage = useCallback(
    (body) => {
      const socket = socketRef.current;
      if (!socket) return;
      const message = {
        body,
        sender: user?._id || user?.id,
        senderName: user?.name || "Guest",
        isAdmin: user?.role === "admin",
        recipient: chatPartner,
        createdAt: new Date().toISOString(),
        temp: true,
      };
      setChatMessages((prev) => [...prev, message]);
      socket.emit("chat:message", message);
    },
    [socketRef, user, chatPartner]
  );

  const joinChat = useCallback(
    (userId, isAdmin = false) => {
      const socket = socketRef.current;
      if (!socket) return;
      socket.emit("chat:user-join", { userId });
      if (isAdmin) setChatPartner(userId);
    },
    [socketRef]
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await notificationService.markAllRead(token);
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  }, [token]);

  const value = {
    connected,
    notifications,
    unread,
    refreshNotifications,
    markAllRead,
    sendChatMessage,
    chatMessages,
    setChatMessages,
    joinChat,
    chatPartner,
    setChatPartner,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
