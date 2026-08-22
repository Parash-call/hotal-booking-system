import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const RoomCard = ({ room, deal }) => {
  const { t } = useLanguage();
  const discountedPrice = deal ? Math.round(room.price * (1 - deal.discount / 100)) : room.price;

  return (
    <article className="room-card">
      <div className="card-img">
        <img src="/images/hotel.jpg" alt={room.type} loading="lazy" />
        {deal && <span className="card-badge deal">-{deal.discount}%</span>}
      </div>
      <div className="card-body">
        <h3>{room.type}</h3>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{room.description}</p>
        {room.features?.length > 0 && (
          <div style={{ margin: "10px 0" }}>
            {room.features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--muted)" }}>
                <Check size={14} color="var(--success)" /> {f}
              </div>
            ))}
          </div>
        )}
        <div className="card-footer">
          <div>
            <span className="price">
              ₹{discountedPrice} <small>{t("perNight")}</small>
            </span>
            {deal && <div><span className="old">₹{room.price}</span></div>}
          </div>
          <Link
            to={`/booking?room=${encodeURIComponent(room.type)}&deal=${deal ? deal.code : ""}`}
            className="btn btn-gold btn-sm"
          >
            {t("bookNow")} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default RoomCard;
