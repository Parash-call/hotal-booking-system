import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import Loading from "../components/Loading";
import { useLanguage } from "../context/LanguageContext";
import roomService from "../services/roomService";
import dealService from "../services/dealService";

const Rooms = () => {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([roomService.getRooms(), dealService.getDeals()])
      .then(([r, d]) => {
        if (!isMounted) return;
        setRooms(r);
        setDeals(d);
      })
      .catch(() => {})
      .finally(() => isMounted && setLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const dealForRoom = (room) => deals.find((d) => d.roomTypes?.includes(room.type));

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="section-head">
        <div>
          <h1 className="section-title">
            {t("availableRooms")} <span>✦</span>
          </h1>
          <p className="section-sub">{t("reviewsSub")}</p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} deal={dealForRoom(room)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
