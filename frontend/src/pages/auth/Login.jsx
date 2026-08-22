import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../components/Toasts";
import ErrorMessage from "../../components/ErrorMessage";

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
    <div className="container" style={{ padding: "50px 20px" }}>
      <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
        <h1 className="section-title">
          {t("login")} <span>✦</span>
        </h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <label className="form-label" htmlFor="l-email">{t("email")}</label>
        <input id="l-email" className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="form-label" htmlFor="l-pass">{t("password")}</label>
        <input id="l-pass" className="form-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn btn-gold btn-block" type="submit" disabled={submitting} style={{ marginTop: 18 }}>
          <LogIn size={17} /> {submitting ? "..." : t("login")}
        </button>
        <p className="auth-note" style={{ textAlign: "center", marginTop: 14, color: "var(--muted)", fontSize: 14 }}>
          {t("noAccount")} <Link to="/register" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{t("register")}</Link>
        </p>
        <div className="alert alert-info" style={{ marginTop: 16, fontSize: 13 }}>
          Demo admin: admin@hotel.com / admin123
        </div>
      </form>
    </div>
  );
};

export default Login;
