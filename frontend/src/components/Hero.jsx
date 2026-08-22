import { useLanguage } from "../context/LanguageContext";
import SearchBox from "./SearchBox";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <img className="hero-bg" src="/images/hotel.jpg" alt="" />
      <div className="container">
        <div className="hero-content">
          <h1>
            {t("heroTitle")} <span>✦</span>
          </h1>
          <p>{t("heroSubtitle")}</p>
        </div>
        <div className="hero-search">
          <SearchBox />
        </div>
      </div>
    </section>
  );
};

export default Hero;
