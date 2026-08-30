import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, CreditCard, Star, ArrowRight, TrendingUp, BedDouble } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Loading from "../../components/Loading";
import bookingService from "../../services/bookingService";
import paymentService from "../../services/paymentService";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hotel_auth") ? JSON.parse(localStorage.getItem("hotel_auth")).token : null;
    if (!token) {
      setLoading(false);
      return;
    }
    Promise.all([bookingService.getMyBookings(token), paymentService.getMyPayments(token)])
      .then(([b, p]) => {
        setBookings(b);
        setPayments(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed");
  const completedBookings = bookings.filter((b) => b.status === "checked-out");

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            {t("welcome")}, {user?.name?.split(" ")[0]}! <span>✦</span>
          </h1>
          <p className="section-sub">{user?.email}</p>
        </div>
        <Link to="/booking" className="btn btn-gold">
          {t("bookNow")} <ArrowRight size={16} />
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-icon blue"><CalendarCheck size={24} /></span>
          <div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">{t("totalBookings")}</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon green"><CreditCard size={24} /></span>
          <div>
            <div className="stat-value">₹{totalSpent.toLocaleString()}</div>
            <div className="stat-label">Total spent</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon gold"><TrendingUp size={24} /></span>
          <div>
            <div className="stat-value">{upcomingBookings.length}</div>
            <div className="stat-label">Upcoming trips</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon purple"><Star size={24} /></span>
          <div>
            <div className="stat-value">{completedBookings.length}</div>
            <div className="stat-label">Completed stays</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>
          {t("recentBookings")} <span>✦</span>
        </h2>
        {bookings.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <BedDouble size={48} />
            <h3>No bookings yet</h3>
            <p>Your upcoming stays will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ boxShadow: "none", border: "1px solid var(--border)" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>{t("roomType")}</th>
                  <th>Dates</th>
                  <th>Rooms</th>
                  <th>{t("total")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.bookingRef}</strong></td>
                    <td>{b.room}</td>
                    <td>{new Date(b.checkin).toLocaleDateString()} → {new Date(b.checkout).toLocaleDateString()}</td>
                    <td>{b.numberOfRooms}</td>
                    <td>₹{b.totalPrice}</td>
                    <td><span className={`badge ${b.status === "confirmed" ? "badge-green" : b.status === "checked-out" ? "badge-gray" : "badge-blue"}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link to="/my-bookings" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>
          {t("viewMyBookings")} <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
