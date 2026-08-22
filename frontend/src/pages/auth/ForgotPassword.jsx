import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, MailCheck } from "lucide-react";
import authService from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const data = await authService.forgotPassword(email);
      setMessage(data.message);
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
          Reset Password <span>✦</span>
        </h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        {message && (
          <div className="alert alert-success" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MailCheck size={18} /> {message}
          </div>
        )}
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>
          Enter your account email and we'll send you a reset link.
        </p>
        <label className="form-label" htmlFor="fp-email">Email</label>
        <input id="fp-email" className="form-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-gold btn-block" type="submit" disabled={submitting} style={{ marginTop: 18 }}>
          <KeyRound size={16} /> {submitting ? "Sending..." : "Send reset link"}
        </button>
        <p style={{ textAlign: "center", marginTop: 14, color: "var(--muted)", fontSize: 14 }}>
          <Link to="/login" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Back to login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
