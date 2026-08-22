import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mic } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const INDIAN_CITIES = [
  "Mumbai", "Delhi", "New Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore",
  "Bhopal", "Patna", "Vadodara", "Ludhiana", "Agra", "Nashik", "Varanasi",
  "Amritsar", "Prayagraj", "Ranchi", "Gwalior", "Jabalpur", "Coimbatore",
  "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Chandigarh", "Guwahati",
  "Udaipur", "Kochi", "Dehradun", "Shimla", "Panaji", "Goa", "Thiruvananthapuram",
  "Mangaluru", "Mysuru", "Hubballi", "Belagavi", "Tiruchirappalli", "Salem",
  "Warangal", "Guntur", "Noida", "Gurugram", "Faridabad", "Ghaziabad",
  "Thiruvananthapuram", "Siliguri", "Jammu", "Srinagar", "Bhubaneswar",
  "Cuttack", "Jamshedpur", "Durgapur", "Asansol", "Rourkela", "Kolhapur",
  "Aurangabad", "Ajmer", "Kota", "Bikaner", "Ujjain", "Jhansi", "Meerut",
  "Aligarh", "Gaya", "Bhavnagar", "Rajkot", "Jamnagar", "Surat",
  "Manali", "Mussoorie", "Nainital", "Darjeeling", "Ooty", "Munnar",
  "Rishikesh", "Haridwar", "Pushkar", "Jaisalmer", "Mount Abu",
  "Mahabaleshwar", "Lonavala", "Puri", "Hampi", "Alappuzha", "Kanyakumari",
  "Rameswaram", "Tirupati", "Shirdi", "Katra", "Port Blair", "Gangtok",
  "Shillong", "Imphal", "Aizawl", "Kohima", "Itanagar", "Agartala"
];

const SearchBox = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");

    const location = query.trim();
    if (!location) {
      setError("Please enter a destination.");
      return;
    }
    if (!checkin || !checkout) {
      setError("Please select both check-in and check-out dates.");
      return;
    }
    if (checkin < today) {
      setError("Check-in date cannot be in the past.");
      return;
    }
    if (checkout <= checkin) {
      setError("Check-out date must be after the check-in date.");
      return;
    }

    const params = new URLSearchParams({
      location,
      checkin,
      checkout,
    });
    if (guests) params.set("guests", guests);
    navigate(`/hotels?${params.toString()}`);
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setTimeout(() => {
        const params = new URLSearchParams({ query: transcript });
        navigate(`/hotels?${params.toString()}`);
      }, 300);
    };

    recognition.start();
  };

  return (
    <form className="search-card" onSubmit={handleSearch}>
      <div className="search-field" style={{ position: "relative" }}>
        <label htmlFor="sq">{t("search")}</label>
        <input
          id="sq"
          type="text"
          list="indian-cities"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <datalist id="indian-cities">
          {INDIAN_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
        <button type="button" className={`voice-btn ${listening ? "listening" : ""}`} onClick={handleVoice} title="Voice search">
          <Mic size={17} />
        </button>
      </div>
      <div className="search-field">
        <label htmlFor="ci">{t("checkIn")}</label>
        <input id="ci" type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
      </div>
      <div className="search-field">
        <label htmlFor="co">{t("checkOut")}</label>
        <input id="co" type="date" min={checkin || today} value={checkout} onChange={(e) => setCheckout(e.target.value)} />
      </div>
      {error && (
        <p role="alert" style={{ color: "#c0392b", margin: 0, fontSize: "0.9rem" }}>
          {error}
        </p>
      )}
      <div className="search-field" style={{ display: "flex", alignItems: "flex-end" }}>
        <button type="submit" className="btn btn-gold">
          <Search size={18} /> {t("search")}
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
