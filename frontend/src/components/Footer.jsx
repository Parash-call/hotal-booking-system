import { Link } from "react-router-dom";
import { Building2, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ color: "#fff", marginBottom: 16 }}>
              <span className="brand-icon">
                <Building2 size={20} />
              </span>
              Grand Hotel
            </div>
            <p style={{ fontSize: 14, opacity: 0.8, maxWidth: 280, lineHeight: 1.7 }}>
              Luxury stays at the best prices. Instant confirmation, secure payments and 24x7 assistance.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", color: "#fff", transition: "0.3s" }} aria-label="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", color: "#fff", transition: "0.3s" }} aria-label="Instagram">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "grid", placeItems: "center", color: "#fff", transition: "0.3s" }} aria-label="Twitter">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/">{t("home")}</Link>
            <Link to="/hotels">{t("hotels")}</Link>
            <Link to="/rooms">{t("rooms")}</Link>
            <Link to="/booking">Book Now</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">{t("login")}</Link>
            <Link to="/register">{t("register")}</Link>
            <Link to="/my-bookings">{t("myBookings")}</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <p style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <Phone size={15} /> +91 98765 43210
            </p>
            <p style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <Mail size={15} /> reservations@grandhotel.com
            </p>
            <p style={{ fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <MapPin size={15} /> MG Road, Mumbai, India
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Grand Hotel Booking System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
