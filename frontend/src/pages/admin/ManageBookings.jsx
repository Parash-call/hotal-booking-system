import { useEffect, useState } from "react";
import { ShieldAlert, Check, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toasts";
import Loading from "../../components/Loading";
import bookingService from "../../services/bookingService";
import paymentService from "../../services/paymentService";

const STATUSES = ["confirmed", "checked-in", "checked-out", "cancelled"];

const statusBadge = (s) =>
  `badge ${s === "confirmed" ? "badge-green" : s === "cancelled" ? "badge-red" : s === "checked-in" ? "badge-blue" : "badge-gray"}`;

const ManageBookings = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [fraudOnly, setFraudOnly] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (fraudOnly) params.fraud = "true";
    bookingService
      .getBookings(params, token)
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter, fraudOnly, token]);

  const updateStatus = async (id, status) => {
    try {
      await bookingService.updateBooking(id, { status }, token);
      showToast(`Booking ${status}`, "success");
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const refund = async (bookingId) => {
    if (!window.confirm("Refund this booking's payment?")) return;
    try {
      const payment = await paymentService.getAllPayments(token);
      const match = payment.find((p) => p.booking?._id === bookingId || p.booking === bookingId);
      if (!match) {
        await bookingService.updateBooking(bookingId, { status: "cancelled" }, token);
        showToast("Booking cancelled (no payment found)", "success");
      } else {
        const data = await paymentService.refund(match._id, token);
        showToast(data.message, "success");
      }
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="admin-topbar">
        <h1>Manage Bookings</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select className="form-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className={`btn btn-sm ${fraudOnly ? "btn-danger" : "btn-outline"}`} onClick={() => setFraudOnly((f) => !f)}>
            <ShieldAlert size={15} /> {fraudOnly ? "Showing flagged" : "Fraud flags"}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Rooms</th>
              <th>Total</th>
              <th>Status</th>
              <th>Fraud</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--muted)" }}>No bookings found.</td></tr>
            )}
            {bookings.map((b) => (
              <tr key={b._id} style={b.fraudFlag ? { background: "#fef2f2" } : undefined}>
                <td><strong>{b.bookingRef}</strong></td>
                <td>
                  {b.name}
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.email}</div>
                </td>
                <td>{b.room}</td>
                <td>{new Date(b.checkin).toLocaleDateString()} → {new Date(b.checkout).toLocaleDateString()}</td>
                <td>{b.numberOfRooms}</td>
                <td>₹{b.totalPrice}</td>
                <td><span className={statusBadge(b.status)}>{b.status}</span></td>
                <td>
                  {b.fraudFlag ? (
                    <span title={b.fraudReasons?.join(" · ")} className="badge badge-red" style={{ cursor: "help" }}>
                      <ShieldAlert size={12} style={{ verticalAlign: -2 }} /> {b.riskScore}%
                    </span>
                  ) : (
                    <span className="badge badge-green"><Check size={12} style={{ verticalAlign: -2 }} /> Clear</span>
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <select
                      className="form-select"
                      style={{ width: "auto", padding: "7px 10px" }}
                      value={b.status}
                      onChange={(e) => updateStatus(b._id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {b.status !== "cancelled" && (
                      <button className="btn btn-danger btn-sm" onClick={() => refund(b._id)} title="Cancel & refund">
                        <X size={14} />
                      </button>
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

export default ManageBookings;
