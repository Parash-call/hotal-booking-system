import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, ArrowRight, Heart, Share2 } from "lucide-react";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Rating from "../components/Rating";
import WeatherWidget from "../components/WeatherWidget";
import MapView from "../components/MapView";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import { useLanguage } from "../context/LanguageContext";
import hotelService from "../services/hotelService";
import reviewService from "../services/reviewService";

const HotelDetails = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    setError("");
    Promise.all([hotelService.getHotel(id), reviewService.getHotelReviews(id)])
      .then(([h, r]) => {
        setHotel(h);
        setReviews(r);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [id]);

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="container" style={{ padding: "60px 20px", maxWidth: 640 }}>
        <ErrorMessage message={error} />
        <Link to="/hotels" className="btn btn-outline">Back to hotels</Link>
      </div>
    );
  }

  const discountPrice = hotel.price;

  return (
    <div className="container" style={{ padding: "36px 20px" }}>
      <div className="detail-hero">
        <img src={hotel.image || "/images/hotel.jpg"} alt={hotel.name} />
        <div className="detail-hero-overlay">
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1>{hotel.name}</h1>
                <p style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.9, marginTop: 8 }}>
                  <MapPin size={16} /> {hotel.location}, {hotel.city}, {hotel.country}
                </p>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
                  <Rating value={hotel.rating} reviews={reviews.length} />
                  <span className="price" style={{ color: "#fff" }}>
                    ₹{discountPrice} <small style={{ color: "rgba(255,255,255,.75)" }}>{t("perNight")}</small>
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="icon-btn" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }} aria-label="Favorite">
                  <Heart size={18} />
                </button>
                <button className="icon-btn" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }} aria-label="Share">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="panel">
            <h2>
              {t("description")} <span>✦</span>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.7 }}>{hotel.description}</p>
            <h3 style={{ margin: "20px 0 12px", fontSize: 17, color: "var(--navy)" }}>{t("amenities")}</h3>
            <div className="amenities-chips">
              {hotel.amenities?.map((a) => (
                <span className="chip" key={a}>{a}</span>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>
              {t("availableRooms")} <span>✦</span>
            </h2>
            {hotel.rooms?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {hotel.rooms.map((room) => (
                  <div
                    key={room._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: 16,
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      flexWrap: "wrap",
                      transition: "0.3s",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--navy)", fontSize: 16 }}>{room.type}</strong>
                      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                        ₹{room.price} {t("perNight")} · {room.features?.join(", ")}
                      </div>
                    </div>
                    <Link to={`/booking?room=${encodeURIComponent(room.type)}`} className="btn btn-gold btn-sm">
                      {t("bookNow")} <ArrowRight size={15} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <Link to="/booking" className="btn btn-gold">
                {t("bookNow")} <ArrowRight size={16} />
              </Link>
            )}
          </div>

          <div className="panel">
            <h2>
              {t("reviews")} <span>✦</span>
            </h2>
            <ReviewList reviews={reviews} />
            <ReviewForm hotelId={id} onSubmitted={loadData} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {hotel.coordinates?.lat && (
            <WeatherWidget lat={hotel.coordinates.lat} lng={hotel.coordinates.lng} city={hotel.city} />
          )}

          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {t("map")} <span>✦</span>
              </h2>
            </div>
            <MapView lat={hotel.coordinates?.lat} lng={hotel.coordinates?.lng} name={hotel.name} />
          </div>

          <div className="panel" style={{ textAlign: "center" }}>
            <Star size={32} style={{ color: "var(--gold)", marginBottom: 10 }} />
            <div style={{ fontSize: 34, fontWeight: 800, color: "var(--navy)" }}>{hotel.rating || "N/A"}</div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
              Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
