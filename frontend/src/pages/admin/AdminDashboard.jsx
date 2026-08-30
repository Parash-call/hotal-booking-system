import { useEffect, useState } from "react";
import { Users, CalendarCheck, IndianRupee, Star, Building2, BedDouble, ShieldAlert, TrendingUp, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import Loading from "../../components/Loading";
import statsService from "../../services/statsService";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AdminDashboard = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService
      .getStats(token)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !stats) return <Loading />;

  const { counts, monthly, recentBookings } = stats;
  const maxRevenue = Math.max(...monthly.map((m) => m.total), 1);

  const cards = [
    { icon: <IndianRupee size={24} />, color: "green", label: t("totalRevenue"), value: `₹${counts.revenue.toLocaleString()}` },
    { icon: <CalendarCheck size={24} />, color: "blue", label: t("totalBookings"), value: counts.bookings },
    { icon: <Users size={24} />, color: "gold", label: t("totalUsers"), value: counts.users },
    { icon: <Star size={24} />, color: "purple", label: t("totalReviews"), value: counts.reviews },
  ];

  return (
    <div>
      <div className="admin-topbar">
        <h1>{t("adminDashboard")}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="badge badge-blue"><Building2 size={12} style={{ verticalAlign: -2 }} /> {counts.hotels} hotels</span>
          <span className="badge badge-blue"><BedDouble size={12} style={{ verticalAlign: -2 }} /> {counts.rooms} room types</span>
          <span className="badge badge-green"><CreditCard size={12} style={{ verticalAlign: -2 }} /> {counts.payments} payments</span>
        </div>
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <span className={`stat-icon ${c.color}`}>{c.icon}</span>
            <div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <div className="panel">
          <h2>
            Monthly Revenue <span>✦</span>
          </h2>
          {monthly.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No revenue data yet.</p>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 220, paddingTop: 10 }}>
              {monthly.map((m) => (
                <div key={m._id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      width: "100%",
                      background: "linear-gradient(to top, var(--gold), var(--gold-light))",
                      borderRadius: "8px 8px 0 0",
                      height: `${Math.max(6, (m.total / maxRevenue) * 100)}%`,
                      minHeight: 8,
                      transition: "height 0.5s ease",
                    }}
                    title={`₹${m.total}`}
                  />
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
                    {MONTH_NAMES[Number(m._id.split("-")[1]) - 1]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>
            {t("recentBookings")} <span>✦</span>
          </h2>
          {recentBookings.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No bookings yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentBookings.map((b) => (
                <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 14px", background: "var(--bg)", borderRadius: 12 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{b.name || b.user?.name || "Guest"}</strong>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.room} · {new Date(b.checkin).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ fontSize: 14 }}>₹{b.totalPrice}</strong>
                    <div style={{ fontSize: 11 }}>
                      {b.fraudFlag ? <span className="badge badge-red">flagged</span> : <span className="badge badge-green">{b.status}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
