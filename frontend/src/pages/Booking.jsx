import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, CreditCard, Wallet, Building, Smartphone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/Toasts";
import bookingService from "../services/bookingService";
import paymentService from "../services/paymentService";
import roomService from "../services/roomService";
import dealService from "../services/dealService";

const METHODS = [
  { id: "card", label: "Card", icon: <CreditCard size={18} /> },
  { id: "upi", label: "UPI", icon: <Smartphone size={18} /> },
  { id: "netbanking", label: "Net Banking", icon: <Building size={18} /> },
  { id: "wallet", label: "Wallet", icon: <Wallet size={18} /> },
];

const emptyForm = {
  fullname: "",
  email: "",
  mobile: "",
  checkin: "",
  checkout: "",
  room: "",
  guests: "2",
  numberOfRooms: "1",
};

const Booking = () => {
  const { user, token } = useAuth();
  const { startBooking, completePayment } = useBooking();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState(emptyForm);
  const [rooms, setRooms] = useState([]);
  const [deals, setDeals] = useState([]);
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullname: prev.fullname || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const room = searchParams.get("room");
    if (room) setForm((prev) => ({ ...prev, room }));
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([roomService.getRooms(), dealService.getDeals()])
      .then(([r, d]) => {
        if (!isMounted) return;
        setRooms(r);
        setDeals(d);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const dealCode = searchParams.get("deal");
  const deal = deals.find((d) => d.code === dealCode && d.roomTypes?.includes(form.room));

  const nights = useMemo(() => {
    if (!form.checkin || !form.checkout) return 0;
    const start = new Date(form.checkin);
    const end = new Date(form.checkout);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [form.checkin, form.checkout]);

  const roomPrice = rooms.find((r) => r.type === form.room)?.price || 0;
  const roomCount = Math.max(1, Number(form.numberOfRooms) || 1);
  const isGroup = roomCount >= 2;

  const pricing = useMemo(() => {
    const subtotal = nights * roomPrice * roomCount;
    const groupDiscount = isGroup ? Math.round(subtotal * 0.1) : 0;
    const dealDiscount = deal ? Math.round((subtotal - groupDiscount) * (deal.discount / 100)) : 0;
    const total = subtotal - groupDiscount - dealDiscount;
    return { subtotal, groupDiscount, dealDiscount, total };
  }, [nights, roomPrice, roomCount, isGroup, deal]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (nights <= 0) return showToast("Check-out must be after check-in", "error");
    if (!form.room) return showToast("Please select a room type", "error");

    setSubmitting(true);
    try {
      const data = await bookingService.createBooking(
        {
          name: form.fullname,
          email: form.email,
          mobile: form.mobile,
          checkin: form.checkin,
          checkout: form.checkout,
          room: form.room,
          guests: form.guests,
          numberOfRooms: form.numberOfRooms,
          discountPercent: deal ? deal.discount : 0,
        },
        token
      );
      setBooking(data.booking);
      startBooking(data.booking);
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await paymentService.createPayment(
        {
          bookingId: booking._id,
          amount: booking.totalPrice,
          method,
          cardNumber: method === "card" ? cardNumber : undefined,
          paymentRef: `${deal ? deal.code : "STD"}-${booking.bookingRef}`,
        },
        token
      );
      completePayment(data.payment);
      showToast(t("paymentSuccessful"), "success");
      navigate("/booking-success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { n: 1, label: "Guest & Stay" },
    { n: 2, label: "Payment" },
    { n: 3, label: "Done" },
  ];

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 900 }}>
      <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
        <div>
          <h1 className="section-title">
            Book Your Stay <span>✦</span>
          </h1>
        </div>
      </div>

      <div className="stepper">
        {steps.map((s, i) => (
          <span key={s.n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span className={`step-line ${step > s.n ? "done" : ""}`} />}
            <span className={`step ${step === s.n ? "active" : ""} ${step > s.n ? "done" : ""}`}>
              <span className="step-num">{step > s.n ? <Check size={15} /> : s.n}</span>
              {s.label}
            </span>
          </span>
        ))}
      </div>

      {step === 1 && (
        <form className="form-card wide" onSubmit={handleCreateBooking}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
            <div>
              <label className="form-label" htmlFor="b-name">{t("fullName")}</label>
              <input id="b-name" className="form-input" type="text" name="fullname" required value={form.fullname} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" htmlFor="b-email">{t("email")}</label>
              <input id="b-email" className="form-input" type="email" name="email" required value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" htmlFor="b-mobile">{t("mobile")}</label>
              <input id="b-mobile" className="form-input" type="tel" name="mobile" required value={form.mobile} onChange={handleChange} placeholder="10-digit number" />
            </div>
            <div>
              <label className="form-label" htmlFor="b-room">{t("roomType")}</label>
              <select id="b-room" className="form-select" name="room" required value={form.room} onChange={handleChange}>
                <option value="">Select room</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r.type}>₹{r.price}/night · {r.type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="b-ci">{t("checkIn")}</label>
              <input id="b-ci" className="form-input" type="date" name="checkin" required value={form.checkin} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" htmlFor="b-co">{t("checkOut")}</label>
              <input id="b-co" className="form-input" type="date" name="checkout" required value={form.checkout} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" htmlFor="b-guests">{t("guests")}</label>
              <input id="b-guests" className="form-input" type="number" min="1" max="10" name="guests" required value={form.guests} onChange={handleChange} />
            </div>
            <div>
              <label className="form-label" htmlFor="b-rooms">{t("numberOfRooms")}</label>
              <input id="b-rooms" className="form-input" type="number" min="1" max="10" name="numberOfRooms" value={form.numberOfRooms} onChange={handleChange} />
              <p className="form-hint">{t("groupBooking")}</p>
            </div>
          </div>

          {nights > 0 && form.room && (
            <div className="panel" style={{ marginTop: 22, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
                <span style={{ color: "var(--muted)" }}>{nights} {t("nights")} × ₹{roomPrice} × {roomCount} room(s)</span>
                <strong>₹{pricing.subtotal}</strong>
              </div>
              {isGroup && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, color: "var(--success)" }}>
                  <span>Group discount (10%)</span>
                  <strong>-₹{pricing.groupDiscount}</strong>
                </div>
              )}
              {deal && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, color: "var(--success)" }}>
                  <span>Deal {deal.code} (-{deal.discount}%)</span>
                  <strong>-₹{pricing.dealDiscount}</strong>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 800, color: "var(--navy)", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                <span>{t("total")}</span>
                <span>₹{pricing.total}</span>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-gold btn-block" disabled={submitting} style={{ marginTop: 18 }}>
            {submitting ? "Creating booking..." : t("continuePayment")}
          </button>
        </form>
      )}

      {step === 2 && booking && (
        <form className="form-card wide" onSubmit={handlePay}>
          <div className="panel" style={{ marginBottom: 20, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
              <span style={{ color: "var(--muted)" }}>Booking {booking.bookingRef} · {booking.room}</span>
              <span style={{ fontWeight: 800, color: "var(--navy)" }}>₹{booking.totalPrice}</span>
            </div>
          </div>

          <label className="form-label">{t("paymentMethod")}</label>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 8 }}>
            {METHODS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 8px",
                  borderRadius: 10,
                  border: method === m.id ? "2px solid var(--gold)" : "1.5px solid var(--border)",
                  background: method === m.id ? "#fff8e6" : "#fff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  color: method === m.id ? "var(--gold-dark)" : "var(--muted)",
                  transition: "var(--transition)",
                }}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {method === "card" && (
            <div>
              <label className="form-label" htmlFor="c-num">{t("cardNumber")}</label>
              <input id="c-num" className="form-input" inputMode="numeric" maxLength={19} required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
              <label className="form-label" htmlFor="c-name">{t("cardName")}</label>
              <input id="c-name" className="form-input" required value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="JOHN DOE" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="form-label" htmlFor="c-exp">{t("expiry")}</label>
                  <input id="c-exp" className="form-input" maxLength={5} required value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="12/28" />
                </div>
                <div>
                  <label className="form-label" htmlFor="c-cvv">{t("cvv")}</label>
                  <input id="c-cvv" className="form-input" type="password" maxLength={4} required value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" />
                </div>
              </div>
            </div>
          )}

          {method === "upi" && (
            <div>
              <label className="form-label" htmlFor="upi-id">UPI ID</label>
              <input id="upi-id" className="form-input" required value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="name@upi" />
              <p className="form-hint">Demo mode: any UPI ID works.</p>
            </div>
          )}

          {method === "netbanking" && (
            <div>
              <label className="form-label" htmlFor="bank">Select Bank</label>
              <select id="bank" className="form-select">
                <option>HDFC Bank</option>
                <option>SBI</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          <div className="alert alert-info" style={{ marginTop: 18 }}>
            <ShieldIcon /> Demo checkout — no real money is charged.
          </div>

          <button type="submit" className="btn btn-gold btn-block" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? "Processing..." : `${t("payNow")} ₹${booking.totalPrice}`}
          </button>
        </form>
      )}
    </div>
  );
};

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

export default Booking;
