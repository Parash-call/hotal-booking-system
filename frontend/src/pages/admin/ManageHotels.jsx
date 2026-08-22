import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toasts";
import Loading from "../../components/Loading";
import hotelService from "../../services/hotelService";

const emptyForm = {
  name: "",
  location: "",
  city: "",
  country: "India",
  description: "",
  price: "",
  rating: "",
  image: "/images/hotel.jpg",
  amenities: "",
  lat: "",
  lng: "",
};

const ManageHotels = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    hotelService
      .getHotels()
      .then(setHotels)
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
      rating: form.rating ? Number(form.rating) : undefined,
      amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      coordinates:
        form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : undefined,
    };
    try {
      if (editingId) {
        await hotelService.updateHotel(editingId, payload, token);
        showToast("Hotel updated", "success");
      } else {
        await hotelService.createHotel(payload, token);
        showToast("Hotel created", "success");
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

  const startEdit = (hotel) => {
    setEditingId(hotel._id);
    setForm({
      ...emptyForm,
      ...hotel,
      amenities: (hotel.amenities || []).join(", "),
      lat: hotel.coordinates?.lat || "",
      lng: hotel.coordinates?.lng || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try {
      await hotelService.deleteHotel(id, token);
      showToast("Hotel deleted", "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Manage Hotels</h1>
        <button className="btn btn-gold btn-sm" onClick={() => { setShowForm((s) => !s); setEditingId(null); setForm(emptyForm); }}>
          <Plus size={16} /> Add Hotel
        </button>
      </div>

      {showForm && (
        <form className="panel" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <h2>{editingId ? "Edit Hotel" : "Add Hotel"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <div>
              <label className="form-label">Name *</label>
              <input className="form-input" name="name" required value={form.name} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Location *</label>
              <input className="form-input" name="location" required value={form.location} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">City *</label>
              <input className="form-input" name="city" required value={form.city} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Country</label>
              <input className="form-input" name="country" value={form.country} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" name="price" type="number" required value={form.price} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Rating (0-5)</label>
              <input className="form-input" name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Latitude</label>
              <input className="form-input" name="lat" type="number" step="any" value={form.lat} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Longitude</label>
              <input className="form-input" name="lng" type="number" step="any" value={form.lng} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label">Image URL</label>
              <input className="form-input" name="image" value={form.image} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" rows={2} value={form.description} onChange={handleChange} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Amenities (comma separated)</label>
              <input className="form-input" name="amenities" value={form.amenities} onChange={handleChange} placeholder="Swimming Pool, Free Wi-Fi, Restaurant" />
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
              <th>Hotel</th>
              <th>City</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>No hotels yet.</td></tr>
            )}
            {hotels.map((h) => (
              <tr key={h._id}>
                <td>
                  <strong>{h.name}</strong>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{h.location}</div>
                </td>
                <td>{h.city}</td>
                <td>₹{h.price}</td>
                <td>{h.rating || "-"}</td>
                <td>{h.rooms?.length || 0}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(h)}><Pencil size={14} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(h._id)}><Trash2 size={14} /></button>
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

export default ManageHotels;
