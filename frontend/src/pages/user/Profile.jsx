import { useState } from "react";
import { UserCircle, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toasts";
import userService from "../../services/userService";

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await userService.updateProfile(
        { name, ...(password ? { password } : {}) },
        token
      );
      setUser(data.user);
      setPassword("");
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
        <h1 className="section-title">
          {user?.name} <span>✦</span>
        </h1>
        <p className="section-sub">{user?.email}</p>
      </div>

      <form className="form-card wide" onSubmit={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>
            <UserCircle size={44} />
          </span>
        </div>

        <label className="form-label" htmlFor="p-name">Name</label>
        <div style={{ position: "relative" }}>
          <input id="p-name" className="form-input" type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ paddingLeft: 40 }} />
          <UserCircle size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>

        <label className="form-label" htmlFor="p-email">Email</label>
        <div style={{ position: "relative" }}>
          <input id="p-email" className="form-input" type="email" disabled value={user?.email} style={{ paddingLeft: 40 }} />
          <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>

        <label className="form-label" htmlFor="p-pass">New Password (optional)</label>
        <div style={{ position: "relative" }}>
          <input id="p-pass" className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" style={{ paddingLeft: 40 }} />
          <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        </div>

        <button className="btn btn-gold btn-block" type="submit" disabled={submitting} style={{ marginTop: 20 }}>
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
