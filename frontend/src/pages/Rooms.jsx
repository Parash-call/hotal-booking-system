import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import Loading from "../components/Loading";
import { useLanguage } from "../context/LanguageContext";
import roomService from "../services/roomService";
import dealService from "../services/dealService";
import { BedDouble } from "lucide-react";

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
          <p className="section-sub">{rooms.length} room types available</p>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <BedDouble size={48} />
          <h3>No rooms available</h3>
          <p>Check back soon for new room types.</p>
        </div>
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
