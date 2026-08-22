import { Star, MessageSquareQuote } from "lucide-react";
import Rating from "./Rating";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const ReviewList = ({ reviews = [], loading }) => {
  if (loading) return <p style={{ color: "var(--muted)", padding: "12px 0" }}>Loading reviews...</p>;

  if (reviews.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)" }}>
        <MessageSquareQuote size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
        <p>No reviews yet. Be the first to review this hotel!</p>
      </div>
    );
  }

  return (
    <div>
      {reviews.map((review) => (
        <div className="review-item" key={review._id}>
          <div className="review-head">
            <span className="avatar">{review.user?.name?.[0]?.toUpperCase() || "G"}</span>
            <div>
              <div className="review-name">{review.user?.name || "Guest"}</div>
              <div className="review-date">{formatDate(review.createdAt)}</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Rating value={review.rating} />
            </div>
          </div>
          {review.title && <div className="review-title">{review.title}</div>}
          <p className="review-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
