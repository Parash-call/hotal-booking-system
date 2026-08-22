import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Mic, Map as MapIcon, List, X } from "lucide-react";
import HotelCard from "../components/HotelCard";
import Loading from "../components/Loading";
import MapView from "../components/MapView";
import { useLanguage } from "../context/LanguageContext";
import hotelService from "../services/hotelService";
import dealService from "../services/dealService";

const MAX_PRICE = 10000;

const Hotels = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("location") || searchParams.get("query") || "");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [showMap, setShowMap] = useState(false);
  const [listening, setListening] = useState(false);

  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const guests = searchParams.get("guests") || "";

  useEffect(() => {
    let isMounted = true;
    Promise.all([hotelService.getHotels(), dealService.getDeals()])
      .then(([h, d]) => {
        if (!isMounted) return;
        setHotels(h);
        setDeals(d);
      })
      .catch(() => {})
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const cities = useMemo(() => [...new Set(hotels.map((h) => h.city))], [hotels]);

  const filtered = useMemo(() => {
    return hotels.filter((h) => {
      const matchQuery =
        !query ||
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.location.toLowerCase().includes(query.toLowerCase()) ||
        h.city.toLowerCase().includes(query.toLowerCase());
      const matchCity = !city || h.city === city;
      const matchPrice = h.price >= minPrice && h.price <= maxPrice;
      return matchQuery && matchCity && matchPrice;
    });
  }, [hotels, query, city, minPrice, maxPrice]);

  const dealForHotel = (hotel) => deals.find((d) => d.roomTypes?.includes(hotel.rooms?.[0]?.type));

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => setQuery(e.results[0][0].transcript);
    recognition.start();
  };

  const mapCenter = filtered[0]?.coordinates;

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            {t("hotels")} <span>✦</span>
          </h1>
          <p className="section-sub">{filtered.length} {t("noResults").length ? "properties available" : ""}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowMap((s) => !s)}>
          {showMap ? <List size={16} /> : <MapIcon size={16} />}
          {showMap ? "List view" : "Map view"}
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", paddingRight: 40 }}
          />
          <button
            type="button"
            className={`voice-btn ${listening ? "listening" : ""}`}
            style={{ top: "auto", transform: "none", bottom: 8, right: 8 }}
            onClick={handleVoice}
          >
            <Mic size={16} />
          </button>
        </div>

        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div style={{ flex: "1 1 240px", minWidth: 200 }}>
          <input
            type="range"
            min={500}
            max={MAX_PRICE}
            step={100}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <input
            type="range"
            min={500}
            max={MAX_PRICE}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div className="range-labels">
            <span>₹{minPrice}</span>
            <span>{t("price")}: ₹{minPrice} - ₹{maxPrice}</span>
            <span>₹{maxPrice}</span>
          </div>
        </div>

        {(query || city || minPrice > 0 || maxPrice < MAX_PRICE) && (
          <button
            className="btn btn-sm"
            onClick={() => {
              setQuery("");
              setCity("");
              setMinPrice(0);
              setMaxPrice(MAX_PRICE);
            }}
          >
            <X size={15} /> Clear
          </button>
        )}
      </div>

      {showMap && (
        <div style={{ marginBottom: 26 }}>
          <MapView lat={mapCenter?.lat} lng={mapCenter?.lng} name={filtered[0]?.name} />
        </div>
      )}

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <MapPin size={44} />
          <h3>{t("noResults")}</h3>
          <p>{t("noHotels")}</p>
        </div>
      ) : (
        <div className="grid">
            {filtered.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} deal={dealForHotel(hotel)} checkin={checkin} checkout={checkout} guests={guests} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Hotels;
