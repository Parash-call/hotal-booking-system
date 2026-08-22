import { useState } from "react";
import { UserCircle } from "lucide-react";
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
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <span className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
            <UserCircle size={40} />
          </span>
        </div>

        <label className="form-label" htmlFor="p-name">Name</label>
        <input id="p-name" className="form-input" type="text" required value={name} onChange={(e) => setName(e.target.value)} />

        <label className="form-label" htmlFor="p-email">Email</label>
        <input id="p-email" className="form-input" type="email" disabled value={user?.email} />

        <label className="form-label" htmlFor="p-pass">New Password (optional)</label>
        <input id="p-pass" className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />

        <button className="btn btn-gold btn-block" type="submit" disabled={submitting} style={{ marginTop: 18 }}>
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
