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
            <div className="brand" style={{ color: "#fff", marginBottom: 12 }}>
              <span className="brand-icon">
                <Building2 size={20} />
              </span>
              Grand Hotel
            </div>
            <p style={{ fontSize: 14, opacity: 0.8, maxWidth: 280 }}>
              Luxury stays at the best prices. Instant confirmation, secure payments and 24x7 assistance.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/">{t("home")}</Link>
            <Link to="/hotels">{t("hotels")}</Link>
            <Link to="/rooms">{t("rooms")}</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">{t("login")}</Link>
            <Link to="/register">{t("register")}</Link>
            <Link to="/my-bookings">{t("myBookings")}</Link>
          </div>
          <div>
            <h4>Contact</h4>
            <p style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <Phone size={15} /> +91 98765 43210
            </p>
            <p style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <Mail size={15} /> reservations@grandhotel.com
            </p>
            <p style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
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
