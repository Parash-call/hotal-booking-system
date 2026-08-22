import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BedDouble, Wifi, BadgePercent, ShieldCheck, ArrowRight } from "lucide-react";
import Hero from "../components/Hero";
import HotelCard from "../components/HotelCard";
import Loading from "../components/Loading";
import { useLanguage } from "../context/LanguageContext";
import hotelService from "../services/hotelService";
import dealService from "../services/dealService";

const Home = () => {
  const { t } = useLanguage();
  const [hotels, setHotels] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([hotelService.getHotels(), dealService.getDeals()])
      .then(([hotelData, dealData]) => {
        if (!isMounted) return;
        setHotels(hotelData);
        setDeals(dealData);
      })
      .catch(() => {})
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const features = [
    { icon: <BedDouble size={26} />, title: t("luxuryRooms"), desc: t("luxuryRoomsDesc") },
    { icon: <Wifi size={26} />, title: t("freeWifi"), desc: t("freeWifiDesc") },
    { icon: <BadgePercent size={26} />, title: t("bestPrices"), desc: t("bestPricesDesc") },
    { icon: <ShieldCheck size={26} />, title: t("securePayment"), desc: t("securePaymentDesc") },
  ];

  return (
    <>
      <Hero />

      <section className="section">
        <div className="container">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
            <div>
              <h2 className="section-title">
                {t("whyUs")} <span>✦</span>
              </h2>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
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

      {deals.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="section-title">
                  {t("smartDeals")} <span>✦</span>
                </h2>
                <p className="section-sub">{t("smartDealsSub")}</p>
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {deals.map((deal) => (
                <div className="deal-card" key={deal._id}>
                  <div className="deal-discount">-{deal.discount}%</div>
                  <h3>{deal.title}</h3>
                  <p>{deal.description}</p>
                  {deal.code && <span className="deal-code">{t("useCode")}: {deal.code}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">
                {t("featuredHotels")} <span>✦</span>
              </h2>
              <p className="section-sub">{t("featuredSub")}</p>
            </div>
            <Link to="/hotels" className="btn btn-outline btn-sm">
              {t("viewAll")} <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : hotels.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center" }}>{t("noHotels")}</p>
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
    </>
  );
};

export default Home;
