import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../components/Toasts";
import ErrorMessage from "../../components/ErrorMessage";
import SocialButtons from "../../components/SocialButtons";

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await login(form);
      showToast(`Welcome back, ${data.user.name}!`, "success");
      navigate(data.user.role === "admin" ? "/admin" : "/");
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
          {t("login")} <span>✦</span>
        </h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label className="form-label" htmlFor="l-email">{t("email")}</label>
        <div style={{ position: "relative" }}>
          <input id="l-email" className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ paddingLeft: 40 }} />
          <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>
        <label className="form-label" htmlFor="l-pass">{t("password")}</label>
        <div style={{ position: "relative" }}>
          <input id="l-pass" className="form-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: 40 }} />
          <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={submitting} style={{ marginTop: 20 }}>
          <LogIn size={17} /> {submitting ? "..." : t("login")}
        </button>

        <SocialButtons />

        <p className="auth-note" style={{ textAlign: "center", marginTop: 16, color: "var(--muted)", fontSize: 14 }}>
          {t("noAccount")} <Link to="/register" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{t("register")}</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
