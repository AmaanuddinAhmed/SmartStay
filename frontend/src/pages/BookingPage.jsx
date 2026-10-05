import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import api, { errorMessage } from "../api";
import { formatDate, formatINR, hotelImage, nightsBetween } from "../constants";

const USER_ID = "USER001"; // No auth service in this mini project

export default function BookingPage() {
  const { state } = useLocation();
  const { search } = useOutletContext();
  const navigate = useNavigate();
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!state?.hotel || !state?.room) {
    return (
      <section className="empty">
        <h1>No room selected</h1>
        <p>Pick a hotel and a room first.</p>
        <Link className="btn primary" to="/">
          Find hotels
        </Link>
      </section>
    );
  }

  const { hotel, room } = state;
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const total = room.pricePerNight * nights;

  const showResult = (result) =>
    navigate("/confirmation", { state: { result, hotel, room } });

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/v2/bookings", {
        userId: USER_ID,
        hotelId: hotel._id,
        roomId: room._id,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: search.guests,
        simulateFailure,
      });
      showResult(data);
    } catch (err) {
      const data = err.response?.data;
      if (data?.saga) {
        showResult(data); // Saga ran (or was rejected): show the outcome and its steps
      } else {
        setError(data?.error || errorMessage(err));
        setLoading(false);
      }
    }
  };

  return (
    <section>
      <Link className="back" to={`/hotels/${hotel._id}`}>
        <ArrowLeftIcon aria-hidden="true" />
        Back to rooms
      </Link>

      <div className="booking">
        <div>
          <h1>Review and pay</h1>
          <p className="muted">
            We reserve the room and take payment in one step. If payment fails,
            nothing is kept.
          </p>

          <label className="demo-toggle">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
            />
            <span>
              <strong>Demo: make the payment fail</strong>
              <br />
              Shows the rollback. The room is released and the booking is
              cancelled.
            </span>
          </label>

          {error && (
            <p className="error spaced" role="alert">
              {error}
            </p>
          )}

          <button
            className="btn primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Processing…" : `Pay ${formatINR(total)}`}
          </button>
        </div>

        <div className="panel">
          <div className="booking-hotel">
            <img
              src={hotelImage(hotel.imageUrl, hotel.name)}
              alt=""
              width="96"
              height="72"
            />
            <div>
              <h2>{hotel.name}</h2>
              <p className="hint">{room.roomType}</p>
            </div>
          </div>
          <dl className="summary">
            <dt>Check-in</dt>
            <dd>{formatDate(search.checkIn)}</dd>
            <dt>Check-out</dt>
            <dd>{formatDate(search.checkOut)}</dd>
            <dt>Guests</dt>
            <dd>{search.guests}</dd>
            <dt>
              {formatINR(room.pricePerNight)} × {nights}{" "}
              {nights === 1 ? "night" : "nights"}
            </dt>
            <dd>{formatINR(total)}</dd>
            <dt className="total">Total</dt>
            <dd className="total">{formatINR(total)}</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
