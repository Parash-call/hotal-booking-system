import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import authService from "../../services/authService";
import { useToast } from "../../components/Toasts";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setSubmitting(true);
    try {
      const data = await authService.resetPassword(token, password);
      showToast(data.message, "success");
      navigate("/login");
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
          New Password <span>✦</span>
        </h1>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        <label className="form-label" htmlFor="np-pass">New Password</label>
        <input id="np-pass" className="form-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <label className="form-label" htmlFor="np-confirm">Confirm Password</label>
        <input id="np-confirm" className="form-input" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="btn btn-gold btn-block" type="submit" disabled={submitting} style={{ marginTop: 18 }}>
          <ShieldCheck size={16} /> {submitting ? "..." : "Reset password"}
        </button>
        <p style={{ textAlign: "center", marginTop: 14, color: "var(--muted)", fontSize: 14 }}>
          <Link to="/login" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
