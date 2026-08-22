import { Star } from "lucide-react";

const Rating = ({ value = 0, reviews = 0, size = 16 }) => {
  const rounded = Math.round(value);
  return (
    <span className="stars" aria-label={`Rating ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rounded ? "currentColor" : "none"}
          strokeWidth={i <= rounded ? 0 : 1.5}
          style={i > rounded ? { color: "#cbd5e1" } : undefined}
        />
      ))}
      {reviews !== undefined && <span className="rating-text">({value} · {reviews})</span>}
    </span>
  );
};

export default Rating;
