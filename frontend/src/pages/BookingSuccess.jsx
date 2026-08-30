import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CalendarCheck, CreditCard, ArrowRight, BedDouble } from "lucide-react";
import { useBooking } from "../context/BookingContext";
import { useLanguage } from "../context/LanguageContext";
import { useSocket } from "../context/SocketContext";

const BookingSuccess = () => {
  const { booking, lastPayment, clearBooking, clearPayment } = useBooking();
  const { t } = useLanguage();
  const { refreshNotifications } = useSocket();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => () => {
    clearBooking();
    clearPayment();
  }, [clearBooking, clearPayment]);

  if (!booking) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <BedDouble size={48} style={{ color: "var(--muted)", marginBottom: 16 }} />
        <h2 className="section-title">No booking found</h2>
        <p style={{ color: "var(--muted)", margin: "12px 0 20px" }}>Start a new booking to see your confirmation.</p>
        <Link to="/booking" className="btn btn-gold">
          {t("bookAnother")} <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const checkin = new Date(booking.checkin).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const checkout = new Date(booking.checkout).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="container" style={{ padding: "50px 20px", maxWidth: 640 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#d1fae5", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={40} color="var(--success)" />
        </div>
        <h1 className="section-title">
          {t("bookingSuccess")} <span>✦</span>
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          A confirmation email has been sent to <strong>{booking.email}</strong>.
        </p>
      </div>

      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 1 }}>{t("bookingRef")}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", letterSpacing: 1 }}>{booking.bookingRef}</div>
          </div>
          <span className={`badge ${booking.fraudFlag ? "badge-yellow" : "badge-green"}`}>
            {booking.fraudFlag ? "Under review" : "Confirmed"}
          </span>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
          <Row icon={<CalendarCheck size={16} />} label="Guest" value={`${booking.name} · ${booking.mobile}`} />
          <Row label="Room" value={`${booking.room} × ${booking.numberOfRooms}`} />
          <Row label="Dates" value={`${checkin} → ${checkout}`} />
          <Row label="Guests" value={String(booking.guests)} />
          <Row label="Total paid" value={`₹${booking.totalPrice}`} bold />
          {lastPayment && (
            <Row icon={<CreditCard size={16} />} label="Receipt" value={lastPayment.transactionId} />
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
        <Link to="/my-bookings" className="btn btn-gold">
          {t("viewMyBookings")} <ArrowRight size={16} />
        </Link>
        <Link to="/" className="btn btn-outline">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

const Row = ({ icon, label, value, bold }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 15, alignItems: "center" }}>
    <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
      {icon} {label}
    </span>
    <strong style={{ color: bold ? "var(--navy)" : "var(--text)", fontWeight: bold ? 800 : 600 }}>{value}</strong>
  </div>
);

export default BookingSuccess;
