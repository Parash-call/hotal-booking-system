import { useEffect, useState, useRef } from "react";
import { Send, Headphones, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../components/Toasts";
import chatService from "../../services/chatService";

const LiveChat = () => {
  const { token, user } = useAuth();
  const { sendChatMessage, chatMessages, setChatMessages, setChatPartner, joinChat } = useSocket();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const loadConversations = () => {
    chatService
      .getConversations(token)
      .then(setConversations)
      .catch(() => {});
  };

  useEffect(() => {
    joinChat(user?._id || user?.id, true);
    loadConversations();
    const interval = setInterval(loadConversations, 8000);
    return () => clearInterval(interval);
  }, [token, user]);

  const openConversation = async (conv) => {
    setActive(conv);
    setChatPartner(conv.userId);
    try {
      const messages = await chatService.getMessages(token, { with: conv.userId });
      setChatMessages(messages);
    } catch {
      setChatMessages([]);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!active) return showToast("Select a conversation first", "error");
    sendChatMessage(input.trim());
    setInput("");
  };

  return (
    <div>
      <div className="admin-topbar">
        <h1>Live Chat</h1>
        <span className="badge badge-green"><Headphones size={12} style={{ verticalAlign: -2 }} /> Online</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, minHeight: 520 }}>
        <div className="panel" style={{ padding: 12, maxHeight: 560, overflowY: "auto" }}>
          {conversations.length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: 14, padding: 12 }}>No conversations yet. When guests message you, they'll appear here.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.userId}
              onClick={() => openConversation(c)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 12,
                borderRadius: 10,
                border: "none",
                background: active?.userId === c.userId ? "#fff8e6" : "transparent",
                textAlign: "left",
                transition: "var(--transition)",
                marginBottom: 4,
              }}
            >
              <span className="avatar">{c.senderName?.[0]?.toUpperCase() || "G"}</span>
              <span>
                <strong style={{ fontSize: 14 }}>{c.senderName}</strong>
                <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                  {c.lastMessage}
                </div>
              </span>
            </button>
          ))}
        </div>

        <div className="panel" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="avatar"><User size={18} /></span>
            <strong>{active ? active.senderName : "Select a guest"}</strong>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {!active && <div className="chat-msg system">Select a conversation from the left to start replying.</div>}
            {active &&
              chatMessages.map((m, i) => (
                <div key={m._id || i} className={`chat-msg ${m.isAdmin ? "bot" : "user"}`}>
                  {m.body}
                </div>
              ))}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Reply as Grand Hotel support..."
              disabled={!active}
            />
            <button className="chat-send" type="submit" disabled={!active}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
