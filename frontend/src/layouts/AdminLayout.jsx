import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarCheck,
  Users,
  Star,
  BadgePercent,
  Headphones,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const { t } = useLanguage();

  const links = [
    { to: "/admin", end: true, icon: <LayoutDashboard size={18} />, label: t("adminDashboard") },
    { to: "/admin/hotels", icon: <Building2 size={18} />, label: t("manageHotels") },
    { to: "/admin/rooms", icon: <BedDouble size={18} />, label: t("manageRooms") },
    { to: "/admin/bookings", icon: <CalendarCheck size={18} />, label: t("manageBookings") },
    { to: "/admin/users", icon: <Users size={18} />, label: t("manageUsers") },
    { to: "/admin/reviews", icon: <Star size={18} />, label: t("manageReviews") },
    { to: "/admin/deals", icon: <BadgePercent size={18} />, label: t("manageDeals") },
    { to: "/admin/chat", icon: <Headphones size={18} />, label: t("liveChat") },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-icon">
            <Building2 size={18} />
          </span>
          Grand Hotel Admin
        </div>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
            {link.icon} {link.label}
          </NavLink>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <NavLink to="/" className="admin-nav-link">
            <Home size={18} /> {t("home")}
          </NavLink>
          <button
            className="admin-nav-link"
            style={{ background: "none", border: "none", width: "100%", textAlign: "left", color: "rgba(255,255,255,.75)" }}
            onClick={logout}
          >
            <span>Logout ({user?.name?.split(" ")[0]})</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
