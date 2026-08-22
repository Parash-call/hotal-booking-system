import { useEffect, useState } from "react";
import { Trash2, Shield, ShieldOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toasts";
import Loading from "../../components/Loading";
import userService from "../../services/userService";

const ManageUsers = () => {
  const { token, user: me } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    userService
      .getUsers(token)
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const toggleRole = async (user) => {
    try {
      await userService.updateUser(user.id, { role: user.role === "admin" ? "user" : "admin" }, token);
      showToast(`${user.name} role updated`, "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await userService.deleteUser(id, token);
      showToast("User deleted", "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Manage Users</h1>
        <span className="badge badge-blue">{users.length} users</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)" }}>No users found.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="avatar">{u.name?.[0]?.toUpperCase()}</span>
                    <strong>{u.name}</strong>
                    {u.id === me?.id && <span className="badge badge-gray">you</span>}
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === "admin" ? "badge-gold" : "badge-gray"}`} style={u.role === "admin" ? { background: "#fef3c7", color: "#92400e" } : undefined}>
                    {u.role}
                  </span>
                </td>
                <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleRole(u)} title="Toggle admin role">
                      {u.role === "admin" ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                    {u.id !== me?.id && (
                      <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}><Trash2 size={14} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
