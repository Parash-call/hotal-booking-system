import { useState, useEffect } from "react";
import { CloudSun, Thermometer, Wind, Droplets } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const WeatherWidget = ({ lat, lng, city }) => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!lat || !lng) return;
    let isMounted = true;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setWeather(data.current);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  if (!weather) {
    return (
      <div className="weather-widget" style={{ background: "linear-gradient(135deg,#94a3b8,#64748b)" }}>
        <CloudSun size={40} />
        <div>
          <div style={{ fontWeight: 700 }}>{t("weather")} {city}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <CloudSun size={40} />
      <div>
        <div style={{ fontWeight: 700 }}>{t("weather")} {city}</div>
        <div className="weather-temp">{Math.round(weather.temperature_2m)}°C</div>
        <div className="weather-detail">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginRight: 12 }}>
            <Wind size={13} /> {Math.round(weather.wind_speed_10m)} km/h
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Droplets size={13} /> {weather.relative_humidity_2m}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
