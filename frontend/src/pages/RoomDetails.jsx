import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Check, BedDouble } from "lucide-react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { useLanguage } from "../context/LanguageContext";
import roomService from "../services/roomService";
import dealService from "../services/dealService";

const RoomDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [room, setRoom] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([roomService.getRoom(id), dealService.getDeals()])
      .then(([r, d]) => {
        if (!isMounted) return;
        setRoom(r);
        setDeals(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <Loading />;
  if (error || !room) {
    return (
      <div className="container" style={{ padding: "60px 20px", maxWidth: 640 }}>
        <ErrorMessage message={error || "Room not found"} />
        <Link to="/rooms" className="btn btn-outline">Back to rooms</Link>
      </div>
    );
  }

  const deal = deals.find((d) => d.roomTypes?.includes(room.type));
  const price = deal ? Math.round(room.price * (1 - deal.discount / 100)) : room.price;

  return (
    <div className="container" style={{ padding: "36px 20px" }}>
      <div className="detail-hero">
        <img src="/images/hotel.jpg" alt={room.type} />
        <div className="detail-hero-overlay">
          <div>
            <h1>{room.type}</h1>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <span className="price" style={{ color: "#fff" }}>
                ₹{price} <small style={{ color: "rgba(255,255,255,.75)" }}>{t("perNight")}</small>
              </span>
              {deal && <span className="badge badge-accent">-{deal.discount}% {deal.code}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h2>
            {t("description")} <span>✦</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.7 }}>{room.description}</p>

          <h3 style={{ margin: "20px 0 12px", fontSize: 17, color: "var(--navy)" }}>Features</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {room.features?.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 15 }}>
                <Check size={16} color="var(--success)" /> {f}
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ textAlign: "center" }}>
          <BedDouble size={32} style={{ color: "var(--gold)", marginBottom: 12 }} />
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--navy)" }}>₹{price}</div>
          <p style={{ color: "var(--muted)", marginBottom: 20 }}>{t("perNight")}</p>
          <Link to={`/booking?room=${encodeURIComponent(room.type)}&deal=${deal ? deal.code : ""}`} className="btn btn-gold btn-block">
            {t("bookNow")} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
