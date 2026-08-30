import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BedDouble, Wifi, BadgePercent, ShieldCheck, ArrowRight, Star, MapPin, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Hero from "../components/Hero";
import HotelCard from "../components/HotelCard";
import Rating from "../components/Rating";
import Loading from "../components/Loading";
import { useLanguage } from "../context/LanguageContext";
import hotelService from "../services/hotelService";
import dealService from "../services/dealService";
import reviewService from "../services/reviewService";

const DESTINATIONS = [
  { name: "Mumbai", image: "/images/hotel.jpg", hotels: 1 },
  { name: "Jaipur", image: "/images/hotel.jpg", hotels: 1 },
  { name: "Udaipur", image: "/images/hotel.jpg", hotels: 1 },
];

const Home = () => {
  const { t } = useLanguage();
  const [hotels, setHotels] = useState([]);
  const [deals, setDeals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.all([hotelService.getHotels(), dealService.getDeals()])
      .then(([hotelData, dealData]) => {
        if (!isMounted) return;
        setHotels(hotelData);
        setDeals(dealData);
        if (hotelData.length > 0) {
          hotelData.forEach((hotel) => {
            reviewService.getHotelReviews(hotel._id).then((r) => {
              if (isMounted) setReviews((prev) => [...prev, ...r]);
            }).catch(() => {});
          });
        }
      })
      .catch(() => {})
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, []);

  const features = [
    { icon: <BedDouble size={28} />, title: "Best Price Guarantee", desc: "We match any lower price found elsewhere." },
    { icon: <BadgePercent size={28} />, title: "Verified Hotels", desc: "Every property is inspected for quality." },
    { icon: <ShieldCheck size={28} />, title: "Secure Booking", desc: "Your payment and data are always protected." },
    { icon: <Wifi size={28} />, title: "24/7 Support", desc: "Our team is available around the clock." },
  ];

  const nextReview = () => setCurrentReview((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <>
      <Hero />

      <section className="section">
        <div className="container">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
            <div>
              <h2 className="section-title">
                Why Choose Us <span>✦</span>
              </h2>
              <p className="section-sub">Everything you need for a perfect stay</p>
            </div>
          </div>
          <div className="grid-4">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg-alt)" }}>
        <div className="container">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
            <div>
              <h2 className="section-title">
                Popular Destinations <span>✦</span>
              </h2>
              <p className="section-sub">Explore our top-rated locations</p>
            </div>
          </div>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {DESTINATIONS.map((d) => (
              <Link to="/hotels" key={d.name} className="destination-card">
                <img src={d.image} alt={d.name} loading="lazy" />
                <div className="destination-overlay">
                  <h3>{d.name}</h3>
                  <p>{d.hotels} hotel{d.hotels !== 1 ? "s" : ""} available</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {deals.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="section-title">
                  Special Offers <span>✦</span>
                </h2>
                <p className="section-sub">Save big with our exclusive deals</p>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {deals.map((deal) => (
                <div className="deal-card" key={deal._id}>
                  <div className="deal-discount">-{deal.discount}%</div>
                  <h3>{deal.title}</h3>
                  <p>{deal.description}</p>
                  {deal.code && <span className="deal-code">USE CODE: {deal.code}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">
                Featured Hotels <span>✦</span>
              </h2>
              <p className="section-sub">Handpicked properties for your next trip</p>
            </div>
            <Link to="/hotels" className="btn btn-outline btn-sm">
              View All <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : hotels.length === 0 ? (
            <div className="empty-state">
              <BedDouble size={48} />
              <h3>No hotels available</h3>
              <p>Check back soon for new properties.</p>
            </div>
          ) : (
            <div className="grid">
              {hotels.slice(0, 6).map((hotel) => {
                const deal = deals.find((d) => d.roomTypes?.includes(hotel.rooms?.[0]?.type));
                return <HotelCard key={hotel._id} hotel={hotel} deal={deal} />;
              })}
            </div>
          )}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section" style={{ background: "var(--bg-alt)" }}>
          <div className="container">
            <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
              <div>
                <h2 className="section-title">
                  Guest Reviews <span>✦</span>
                </h2>
                <p className="section-sub">What our guests are saying</p>
              </div>
            </div>
            <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
              <div className="panel" style={{ textAlign: "center", padding: 40 }}>
                <Quote size={32} style={{ color: "var(--accent)", marginBottom: 16 }} />
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <Rating value={reviews[currentReview]?.rating || 5} />
                </div>
                <p style={{ fontSize: 18, fontStyle: "italic", marginBottom: 16, lineHeight: 1.7 }}>
                  "{reviews[currentReview]?.comment}"
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <span className="avatar">{reviews[currentReview]?.user?.name?.[0]?.toUpperCase() || "G"}</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, color: "var(--primary)" }}>{reviews[currentReview]?.user?.name || "Guest"}</div>
                  </div>
                </div>
              </div>
              {reviews.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
                  <button className="icon-btn" onClick={prevReview} aria-label="Previous review"><ChevronLeft size={18} /></button>
                  <button className="icon-btn" onClick={nextReview} aria-label="Next review"><ChevronRight size={18} /></button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
