import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toasts";
import Loading from "../../components/Loading";
import dealService from "../../services/dealService";

const emptyForm = { title: "", description: "", discount: "", roomTypes: "", code: "", active: true };

const ManageDeals = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    dealService
      .getAllDeals(token)
      .then(setDeals)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      discount: Number(form.discount),
      roomTypes: form.roomTypes.split(",").map((r) => r.trim()).filter(Boolean),
      active: form.active === true || form.active === "true",
    };
    try {
      if (editingId) {
        await dealService.updateDeal(editingId, payload, token);
        showToast("Deal updated", "success");
      } else {
        await dealService.createDeal(payload, token);
        showToast("Deal created", "success");
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

  const startEdit = (deal) => {
    setEditingId(deal._id);
    setForm({ ...deal, roomTypes: (deal.roomTypes || []).join(", "), active: deal.active });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this deal?")) return;
    try {
      await dealService.deleteDeal(id, token);
      showToast("Deal deleted", "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Smart Deals</h1>
        <button className="btn btn-gold btn-sm" onClick={() => { setShowForm((s) => !s); setEditingId(null); setForm(emptyForm); }}>
          <Plus size={16} /> New Deal
        </button>
      </div>

      {showForm && (
        <form className="panel" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <h2>{editingId ? "Edit Deal" : "Create Deal"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <div>
              <label className="form-label">Title *</label>
              <input className="form-input" name="title" required value={form.title} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Discount % *</label>
              <input className="form-input" name="discount" type="number" min="1" max="90" required value={form.discount} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Code</label>
              <input className="form-input" name="code" value={form.code} onChange={handleChange} placeholder="WEEKEND20" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" rows={2} value={form.description} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Room Types (comma separated)</label>
              <input className="form-input" name="roomTypes" value={form.roomTypes} onChange={handleChange} placeholder="Deluxe Room, Suite Room" />
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
              <th>Deal</th>
              <th>Discount</th>
              <th>Code</th>
              <th>Rooms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>No deals yet.</td></tr>
            )}
            {deals.map((d) => (
              <tr key={d._id}>
                <td>
                  <strong>{d.title}</strong>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{d.description}</div>
                </td>
                <td style={{ fontWeight: 800, color: "var(--gold-dark)" }}>-{d.discount}%</td>
                <td>{d.code && <span className="deal-code" style={{ color: "var(--navy)", borderColor: "var(--gold)" }}>{d.code}</span>}</td>
                <td>{d.roomTypes?.join(", ")}</td>
                <td><span className={`badge ${d.active ? "badge-green" : "badge-gray"}`}>{d.active ? "Active" : "Inactive"}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(d)}><Pencil size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(d._id)}><Trash2 size={14} /></button>
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

export default ManageDeals;
