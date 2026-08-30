import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../components/Toasts";
import ErrorMessage from "../../components/ErrorMessage";
import SocialButtons from "../../components/SocialButtons";

const Register = () => {
  const { register, login } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      await login({ email: form.email, password: form.password });
      showToast("Account created successfully!", "success");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "60px 20px" }}>
      <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
        <h1 className="section-title">
          {t("register")} <span>✦</span>
        </h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label className="form-label" htmlFor="r-name">{t("fullName")}</label>
        <div style={{ position: "relative" }}>
          <input id="r-name" className="form-input" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ paddingLeft: 40 }} />
          <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>
        <label className="form-label" htmlFor="r-email">{t("email")}</label>
        <div style={{ position: "relative" }}>
          <input id="r-email" className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: 40 }} />
          <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>
        <label className="form-label" htmlFor="r-pass">{t("password")}</label>
        <div style={{ position: "relative" }}>
          <input id="r-pass" className="form-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: 40 }} />
          <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>
        <label className="form-label" htmlFor="r-confirm">{t("confirmPassword")}</label>
        <div style={{ position: "relative" }}>
          <input id="r-confirm" className="form-input" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} style={{ paddingLeft: 40 }} />
          <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={submitting} style={{ marginTop: 20 }}>
          <UserPlus size={17} /> {submitting ? "..." : t("register")}
        </button>

        <SocialButtons />

        <p style={{ textAlign: "center", marginTop: 16, color: "var(--muted)", fontSize: 14 }}>
          {t("hasAccount")} <Link to="/login" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{t("login")}</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
