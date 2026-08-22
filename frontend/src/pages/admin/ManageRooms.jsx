import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toasts";
import Loading from "../../components/Loading";
import roomService from "../../services/roomService";

const emptyForm = { type: "", price: "", description: "", features: "" };

const ManageRooms = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    roomService
      .getRooms()
      .then(setRooms)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await roomService.updateRoom(editingId, payload, token);
        showToast("Room updated", "success");
      } else {
        await roomService.createRoom(payload, token);
        showToast("Room created", "success");
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (room) => {
    setEditingId(room._id);
    setForm({ ...room, features: (room.features || []).join(", ") });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this room type?")) return;
    try {
      await roomService.deleteRoom(id, token);
      showToast("Room deleted", "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Manage Rooms</h1>
        <button className="btn btn-gold btn-sm" onClick={() => { setShowForm((s) => !s); setEditingId(null); setForm(emptyForm); }}>
          <Plus size={16} /> Add Room
        </button>
      </div>

      {showForm && (
        <form className="panel" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <h2>{editingId ? "Edit Room" : "Add Room"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <div>
              <label className="form-label">Type *</label>
              <input className="form-input" name="type" required value={form.type} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" name="price" type="number" required value={form.price} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" rows={2} value={form.description} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Features (comma separated)</label>
              <input className="form-input" name="features" value={form.features} onChange={handleChange} placeholder="King Size Bed, Free Wi-Fi, AC" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Price</th>
              <th>Description</th>
              <th>Features</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)" }}>No rooms yet.</td></tr>
            )}
            {rooms.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.type}</strong></td>
                <td>₹{r.price}</td>
                <td>{r.description}</td>
                <td>{r.features?.length || 0} features</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(r)}><Pencil size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(r._id)}><Trash2 size={14} /></button>
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

export default ManageRooms;
