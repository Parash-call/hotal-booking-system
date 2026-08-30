import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight } from "lucide-react";
import Rating from "./Rating";
import { useLanguage } from "../context/LanguageContext";

const HotelCard = ({ hotel, deal }) => {
  const { t } = useLanguage();
  const discountedPrice = deal && hotel.price ? Math.round(hotel.price * (1 - deal.discount / 100)) : hotel.price;

  return (
    <article className="hotel-card">
      <div className="card-img">
        <img src={hotel.image || "/images/hotel.jpg"} alt={hotel.name} loading="lazy" />
        {deal && <span className="card-badge deal">-{deal.discount}%</span>}
        {hotel.rating > 0 && (
          <span className="card-badge" style={{ right: 14, left: "auto", background: "var(--gold)", color: "#fff" }}>
            <Star size={12} fill="currentColor" /> {hotel.rating}
          </span>
        )}
      </div>
      <div className="card-body">
        <h3>{hotel.name}</h3>
        <p className="card-loc">
          <MapPin size={14} /> {hotel.location}, {hotel.city}
        </p>
        {hotel.amenities?.length > 0 && (
          <div className="amenities-chips">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span className="chip" key={a}>{a}</span>
            ))}
          </div>
        )}
        <div className="card-footer">
          <div>
            <span className="price">
              ₹{discountedPrice} <small>{t("perNight")}</small>
            </span>
            {deal && <div><span className="old">₹{hotel.price}</span></div>}
          </div>
          <Link to={`/hotels/${hotel._id}`} className="btn btn-gold btn-sm">
            {t("bookNow")} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
