import { Link, useOutletContext } from "react-router-dom";
import {
  CheckIcon,
  XIcon,
  MinusIcon,
  MapPinIcon,
  StarIcon,
} from "@phosphor-icons/react";
import { PURPOSES, formatINR, hotelImage } from "../constants";

function Match({ value }) {
  const tier = value >= 80 ? "high" : value >= 50 ? "mid" : "low";
  return (
    <div className={`match ${tier}`}>
      <strong>{value}%</strong>
      <span>match</span>
    </div>
  );
}

const REASON_ICONS = { yes: CheckIcon, no: XIcon, partial: MinusIcon };

// Reasons arrive as "✓ ...", "✗ ...", "~ ..." from Recommendation Service
function Reason({ text }) {
  const kind = text[0] === "✓" ? "yes" : text[0] === "✗" ? "no" : "partial";
  const Icon = REASON_ICONS[kind];
  return (
    <li className={`reason ${kind}`}>
      <Icon aria-hidden="true" />
      {text.slice(2)}
    </li>
  );
}

export default function ResultsPage() {
  const { search, results } = useOutletContext();

  if (!results) {
    return (
      <section className="empty">
        <h1>No search yet</h1>
        <p>Start with where you're going and why.</p>
        <Link className="btn primary" to="/">
          Find hotels
        </Link>
      </section>
    );
  }

  const purpose = PURPOSES.find(
    (p) => p.value === search.purpose,
  )?.label.toLowerCase();

  return (
    <section>
      <div className="results-head">
        <h1>
          {results.length} {results.length === 1 ? "hotel" : "hotels"} in{" "}
          {search.destination}
        </h1>
        <p>
          Best match first, for a {purpose} trip up to{" "}
          {formatINR(search.budget)} a night. <Link to="/">Change search</Link>
        </p>
      </div>

      {results.length === 0 ? (
        <div className="panel">
          <p>
            No hotels found in {search.destination}. Try another city, or add
            hotels for it in Hotel Service.
          </p>
        </div>
      ) : (
        <ol className="results">
          {results.map((hotel, i) => (
            <li key={hotel.hotelId} className="result">
              <img
                src={hotelImage(hotel.imageUrl, hotel.name)}
                alt={hotel.name}
                width="200"
                height="150"
                loading="lazy"
              />
              <div>
                <h2>{hotel.name}</h2>
                <div className="meta">
                  <span className="icon-text">
                    <MapPinIcon aria-hidden="true" />
                    {hotel.location}
                  </span>
                  <span className="icon-text">
                    <StarIcon aria-hidden="true" />
                    {hotel.rating} / 5
                  </span>
                  <span>{formatINR(hotel.pricePerNight)} a night</span>
                </div>
                <ul className="reasons">
                  {hotel.reasons.map((r) => (
                    <Reason key={r} text={r} />
                  ))}
                </ul>
              </div>
              <div className="result-side">
                <Match value={hotel.matchScore} />
                <Link
                  className={i === 0 ? "btn primary" : "btn"}
                  to={`/hotels/${hotel.hotelId}`}
                >
                  View rooms
                </Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
