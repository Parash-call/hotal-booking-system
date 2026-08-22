import { useEffect, useState } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toasts";
import Loading from "../../components/Loading";
import reviewService from "../../services/reviewService";

const ManageReviews = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    reviewService
      .getAllReviews(token)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const setStatus = async (id, status) => {
    try {
      await reviewService.updateStatus(id, status, token);
      showToast(`Review ${status}`, "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await reviewService.deleteReview(id, token);
      showToast("Review deleted", "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Manage Reviews</h1>
        <span className="badge badge-blue">{reviews.length} reviews</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {reviews.length === 0 && (
          <div className="empty-state"><Star size={44} /><h3>No reviews yet</h3></div>
        )}
        {reviews.map((r) => (
          <div className="panel" key={r._id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span className="avatar">{r.user?.name?.[0]?.toUpperCase() || "G"}</span>
                  <strong>{r.user?.name || "Guest"}</strong>
                  <span className="stars" style={{ color: "var(--gold)" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill={i <= r.rating ? "currentColor" : "none"} strokeWidth={i <= r.rating ? 0 : 1.5} />
                    ))}
                  </span>
                  <span className={`badge ${r.status === "approved" ? "badge-green" : r.status === "rejected" ? "badge-red" : "badge-yellow"}`}>
                    {r.status}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
                  {r.hotel?.name || "Hotel"} · {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {r.status !== "approved" && (
                  <button className="btn btn-success btn-sm" onClick={() => setStatus(r._id, "approved")}><Check size={14} /> Approve</button>
                )}
                {r.status !== "rejected" && (
                  <button className="btn btn-outline btn-sm" onClick={() => setStatus(r._id, "rejected")}><X size={14} /></button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => remove(r._id)}><Trash2 size={14} /></button>
              </div>
            </div>
            {r.title && <div style={{ fontWeight: 700, marginTop: 10 }}>{r.title}</div>}
            <p style={{ color: "var(--muted)", fontSize: 14.5 }}>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageReviews;
