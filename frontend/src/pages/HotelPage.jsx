import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { ArrowLeftIcon, MapPinIcon, StarIcon } from "@phosphor-icons/react";
import api, { errorMessage } from "../api";
import {
  amenityLabel,
  formatDate,
  formatINR,
  hotelImage,
  nightsBetween,
} from "../constants";

function HotelSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading hotel">
      <div className="hotel-top">
        <div className="skeleton sk-image" />
        <div>
          <div className="skeleton sk-title" />
          <div className="skeleton sk-line sk-w60" />
          <div className="skeleton sk-line" />
          <div className="skeleton sk-line sk-w80" />
        </div>
      </div>
    </section>
  );
}

export default function HotelPage() {
  const { id } = useParams();
  const { search } = useOutletContext();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.all([
      api.get(`/v1/hotels/${id}`),
      api.get("/v1/rooms", { params: { hotelId: id } }),
    ])
      .then(([hotelRes, roomsRes]) => {
        if (!ignore) {
          setHotel(hotelRes.data);
          setRooms(roomsRes.data);
        }
      })
      .catch((err) => {
        if (!ignore) setError(errorMessage(err));
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const nights = nightsBetween(search.checkIn, search.checkOut);

  if (error) {
    return (
      <section className="empty">
        <h1>Couldn't load this hotel</h1>
        <p>{error}</p>
        <Link className="btn" to="/results">
          Back to results
        </Link>
      </section>
    );
  }

  if (!hotel) return <HotelSkeleton />;

  return (
    <section>
      <Link className="back" to="/results">
        <ArrowLeftIcon aria-hidden="true" />
        Back to results
      </Link>

      <div className="hotel-top">
        <img
          src={hotelImage(hotel.imageUrl, hotel.name)}
          alt={hotel.name}
          width="800"
          height="600"
        />
        <div>
          <h1>{hotel.name}</h1>
          <div className="meta">
            <span className="icon-text">
              <MapPinIcon aria-hidden="true" />
              {hotel.location}
            </span>
            <span className="icon-text">
              <StarIcon aria-hidden="true" />
              {hotel.rating} / 5
            </span>
            <span>From {formatINR(hotel.priceRange)} a night</span>
          </div>
          {hotel.suitableFor?.length > 0 && (
            <p>Good for {hotel.suitableFor.join(", ")}.</p>
          )}
          {hotel.description && <p className="muted">{hotel.description}</p>}
          <ul className="tags">
            {hotel.amenities.map((a) => (
              <li key={a}>{amenityLabel(a)}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2>Rooms</h2>
      <p className="hint">
        {formatDate(search.checkIn)} to {formatDate(search.checkOut)},{" "}
        {search.guests} {search.guests === 1 ? "guest" : "guests"}
      </p>

      {rooms.length === 0 ? (
        <p className="muted spaced-top">
          This hotel has no rooms listed yet.
        </p>
      ) : (
        <ul className="rooms">
          {rooms.map((room) => {
            const tooSmall = room.capacity < search.guests;
            return (
              <li key={room._id} className="room">
                <div>
                  <h3>{room.roomType}</h3>
                  <p className="room-note">
                    Up to {room.capacity} guests,{" "}
                    {formatINR(room.pricePerNight)} a night
                  </p>
                  {!room.available && (
                    <p className="room-note">Already reserved</p>
                  )}
                  {room.available && tooSmall && (
                    <p className="room-note">
                      Too small for {search.guests} guests
                    </p>
                  )}
                </div>
                <div className="room-price">
                  <strong>{formatINR(room.pricePerNight * nights)}</strong>
                  <span className="hint">
                    for {nights} {nights === 1 ? "night" : "nights"}
                  </span>
                </div>
                <button
                  className="btn primary"
                  disabled={!room.available || tooSmall}
                  onClick={() => navigate("/book", { state: { hotel, room } })}
                >
                  Book this room
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
