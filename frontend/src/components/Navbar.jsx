import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Building2, Bell, User, LogOut, LayoutDashboard, Globe, ChevronDown, Settings, Menu, X, Home, BedDouble, CreditCard, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSocket } from "../context/SocketContext";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

const NotificationBell = () => {
  const { unread, notifications, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <Bell size={19} />
        {unread > 0 && <span className="badge-dot">{unread}</span>}
      </button>
      {open && (
        <div className="dropdown-menu" style={{ right: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px" }}>
            <strong>Notifications</strong>
            {unread > 0 && (
              <button className="btn btn-sm btn-outline" style={{ padding: "4px 10px", fontSize: 12 }} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 && (
              <p style={{ padding: 16, color: "var(--muted)", fontSize: 14, textAlign: "center" }}>No notifications</p>
            )}
            {notifications.map((n) => (
              <Link key={n._id} to={n.target || "#"} className={`notif-item ${n.read ? "" : "unread"}`} onClick={() => setOpen(false)}>
                <span className="notif-icon">
                  <Bell size={16} />
                </span>
                <span>
                  <span className="notif-title">{n.title}</span>
                  <span className="notif-body">{n.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LanguageSwitcher = () => {
  const { lang, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang);

  return (
    <div className="dropdown" ref={ref}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Language">
        <Globe size={19} />
      </button>
      {open && (
        <div className="dropdown-menu" style={{ left: 0, right: "auto" }}>
          <div className="lang-menu">
            {LANGS.map((l) => (
              <button
                key={l.code}
                className={`lang-opt ${l.code === lang ? "active" : ""}`}
                onClick={() => changeLanguage(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", padding: "8px 6px 2px" }}>{current?.label}</p>
        </div>
      )}
    </div>
  );
};

const UserMenu = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
        <Link to="/register" className="btn btn-gold btn-sm">Register</Link>
      </div>
    );
  }

  const initials = user.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="dropdown" ref={ref}>
      <button className="user-chip" onClick={() => setOpen((o) => !o)}>
        <span className="avatar">{initials}</span>
        {user.name?.split(" ")[0]}
        <ChevronDown size={15} style={{ color: "var(--muted)" }} />
      </button>
      {open && (
        <div className="dropdown-menu">
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="dropdown-item" onClick={() => setOpen(false)}>
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link to="/my-bookings" className="dropdown-item" onClick={() => setOpen(false)}>
            <Settings size={16} /> My Bookings
          </Link>
          <Link to="/profile" className="dropdown-item" onClick={() => setOpen(false)}>
            <User size={16} /> Profile
          </Link>
          <button className="dropdown-item danger" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

const MobileNav = ({ open, onClose }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const visitedHotels = typeof sessionStorage !== "undefined" && sessionStorage.getItem("visitedHotels") === "1";

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="mobile-nav open" onClick={onClose}>
      <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
        <button className="mobile-nav-close" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>

        <Link to="/" className="mobile-nav-link" onClick={onClose}>
          <Home size={18} /> {t("home")}
        </Link>
        {isAuthenticated && (
          <Link to="/hotels" className="mobile-nav-link" onClick={onClose}>
            <Building2 size={18} /> {t("hotels")}
          </Link>
        )}
        {isAuthenticated && visitedHotels && (
          <Link to="/rooms" className="mobile-nav-link" onClick={onClose}>
            <BedDouble size={18} /> {t("rooms")}
          </Link>
        )}
        {isAuthenticated && (
          <Link to="/my-bookings" className="mobile-nav-link" onClick={onClose}>
            <CreditCard size={18} /> {t("myBookings")}
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" className="mobile-nav-link" onClick={onClose}>
            <LayoutDashboard size={18} /> {t("admin")}
          </Link>
        )}

        <div className="mobile-nav-divider" />

        {!isAuthenticated && (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={onClose}>
              <User size={18} /> {t("login")}
            </Link>
            <Link to="/register" className="mobile-nav-link" onClick={onClose}>
              <HelpCircle size={18} /> {t("register")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const { t } = useLanguage();
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const visitedHotels = typeof sessionStorage !== "undefined" && sessionStorage.getItem("visitedHotels") === "1";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <Building2 size={20} />
            </span>
            Grand Hotel
          </Link>

          <nav className="nav-links" key={location.pathname + String(isAuthenticated) + String(visitedHotels)}>
            <NavLink to="/" className="nav-link" end>{t("home")}</NavLink>
            {isAuthenticated && <NavLink to="/hotels" className="nav-link">{t("hotels")}</NavLink>}
            {isAuthenticated && visitedHotels && <NavLink to="/rooms" className="nav-link">{t("rooms")}</NavLink>}
            {isAdmin && <NavLink to="/admin" className="nav-link">{t("admin")}</NavLink>}
          </nav>

          <div className="nav-actions">
            <LanguageSwitcher />
            {isAuthenticated && <NotificationBell />}
            <UserMenu />
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Navbar;
