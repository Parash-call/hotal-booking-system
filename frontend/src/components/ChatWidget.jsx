import { useState, useRef, useEffect } from "react";
import { Bot, MessageCircle, X, Send, Sparkles, Headphones } from "lucide-react";
import assistantService from "../services/assistantService";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "./Toasts";

const SUGGESTIONS = [
  "How much is the Suite Room?",
  "How do I book a room?",
  "What facilities do you have?",
  "What are the check-in timings?",
  "Do you have group discounts?",
];

const ChatWidget = () => {
  const { user, token } = useAuth();
  const { connected, sendChatMessage, chatMessages, joinChat } = useSocket();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("assistant");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && tab === "assistant" && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: "Hello! I'm the Grand Hotel assistant. Ask me about rooms, prices, booking or facilities.",
        },
      ]);
    }
  }, [open, tab, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chatMessages]);

  useEffect(() => {
    if (user && tab === "chat") joinChat(user?._id || user?.id);
  }, [user, tab, joinChat]);

  const sendAssistant = async (text) => {
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    try {
      const data = await assistantService.chat(text, token);
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I'm having trouble right now. Please try again later." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const sendLive = (text) => {
    if (!connected) {
      showToast("Live chat is offline. Using AI assistant instead.", "error");
      setTab("assistant");
      sendAssistant(text);
      return;
    }
    if (!user) {
      showToast("Please login to use live chat with our team.", "info");
    }
    sendChatMessage(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (tab === "assistant") sendAssistant(input.trim());
    else sendLive(input.trim());
    setInput("");
  };

  const displayMessages = tab === "assistant" ? messages : chatMessages;

  return (
    <div className="chat-fab">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span className="avatar">
              {tab === "assistant" ? <Bot size={18} /> : <Headphones size={18} />}
            </span>
            <div>
              <h4>{tab === "assistant" ? t("aiAssistant") : t("liveChat")}</h4>
              <p>
                {tab === "assistant" ? "Powered by Grand Hotel AI" : connected ? "Team online" : "Reconnecting..."}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff" }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="chat-tabs">
            <button className={`chat-tab ${tab === "assistant" ? "active" : ""}`} onClick={() => setTab("assistant")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} /> {t("aiAssistant")}
              </span>
            </button>
            <button className={`chat-tab ${tab === "chat" ? "active" : ""}`} onClick={() => setTab("chat")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Headphones size={14} /> {t("liveChat")}
              </span>
            </button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {tab === "assistant" &&
              messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role === "bot" ? "bot" : "user"}`}>
                  {m.text}
                </div>
              ))}

            {tab === "chat" &&
              (chatMessages.length === 0 ? (
                <div className="chat-msg system">Connect with our team. We usually reply in a few minutes.</div>
              ) : (
                chatMessages.map((m, i) => (
                  <div key={m._id || i} className={`chat-msg ${m.isAdmin ? "bot" : "user"}`}>
                    {m.body}
                  </div>
                ))
              ))}

            {typing && <div className="chat-msg bot">Typing...</div>}
          </div>

          {tab === "assistant" && messages.length <= 1 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chat-suggestion" onClick={() => sendAssistant(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chat-input-row" onSubmit={handleSubmit}>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("typeMessage")}
            />
            <button className="chat-send" type="submit" aria-label="Send">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button className="chat-bubble" onClick={() => setOpen((o) => !o)} aria-label="Chat">
        <span className="chat-label">{t("needHelp")}</span>
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
};

export default ChatWidget;
