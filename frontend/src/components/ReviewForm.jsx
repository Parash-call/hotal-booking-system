import { useState } from "react";
import { Star, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "./Toasts";
import reviewService from "../services/reviewService";

const ReviewForm = ({ hotelId, onSubmitted }) => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return showToast("Please select a rating", "error");
    if (!comment.trim()) return showToast("Please write a comment", "error");

    setSubmitting(true);
    try {
      const data = await reviewService.addReview({ hotel: hotelId, rating, title, comment }, token);
      showToast(data.message, "success");
      setRating(0);
      setTitle("");
      setComment("");
      onSubmitted?.();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-card wide" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <h3 style={{ color: "var(--navy)", marginBottom: 4 }}>{t("submitReview")}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{t("yourRating")}:</span>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              type="button"
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              style={{ background: "none", border: "none", color: i <= (hover || rating) ? "var(--gold)" : "#cbd5e1", padding: 2 }}
              aria-label={`${i} stars`}
            >
              <Star size={22} fill="currentColor" strokeWidth={0} />
            </button>
          ))}
        </div>
      </div>

      <label className="form-label" htmlFor="rv-title">Title</label>
      <input
        id="rv-title"
        className="form-input"
        type="text"
        placeholder="Sum up your stay"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="form-label" htmlFor="rv-comment">{t("comment")}</label>
      <textarea
        id="rv-comment"
        className="form-textarea"
        rows={3}
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button type="submit" className="btn btn-gold btn-block" disabled={submitting} style={{ marginTop: 16 }}>
        <Send size={16} /> {submitting ? "..." : t("addReview")}
      </button>
    </form>
  );
};

export default ReviewForm;
