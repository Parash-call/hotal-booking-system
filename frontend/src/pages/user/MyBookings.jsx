import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../components/Toasts";
import Loading from "../../components/Loading";
import bookingService from "../../services/bookingService";
import { CalendarX, BedDouble } from "lucide-react";

const statusBadge = (status) => {
  const map = {
    confirmed: "badge-green",
    "checked-in": "badge-blue",
    "checked-out": "badge-gray",
    cancelled: "badge-red",
  };
  return `badge ${map[status] || "badge-gray"}`;
};

const MyBookings = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    bookingService
      .getMyBookings(token)
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const data = await bookingService.cancelBooking(id, token);
      showToast(data.message, "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-head">
        <h1 className="section-title">
          {t("myBookings")} <span>✦</span>
        </h1>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <BedDouble size={48} />
          <h3>No bookings yet</h3>
          <p>Your upcoming stays will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {bookings.map((b) => (
            <div className="panel" key={b._id} style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <strong style={{ fontSize: 16, color: "var(--navy)" }}>{b.room}</strong>
                  <span className={`badge ${statusBadge(b.status)}`}>{b.status}</span>
                  {b.groupBooking && <span className="badge badge-yellow">Group</span>}
                  {b.fraudFlag && <span className="badge badge-red">{t("fraudFlagged")}</span>}
                </div>
                <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 6 }}>
                  Ref {b.bookingRef} · {new Date(b.checkin).toLocaleDateString()} → {new Date(b.checkout).toLocaleDateString()} · {b.numberOfRooms} room(s) · {b.guests} guest(s)
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>₹{b.totalPrice}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{t("paymentMethod")}: {b.paymentStatus || "pending"}</div>
                {b.status !== "cancelled" && (
                  <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => cancel(b._id)}>
                    {t("cancel")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
