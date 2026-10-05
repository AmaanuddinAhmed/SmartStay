import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CheckIcon } from "@phosphor-icons/react";
import api, { errorMessage } from "../api";
import { PURPOSES, AMENITIES, nightsBetween } from "../constants";

export default function SearchPage() {
  const { search, setSearch, setResults } = useOutletContext();
  const [form, setForm] = useState(search);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const nights = nightsBetween(form.checkIn, form.checkOut);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const togglePreference = (value) =>
    setForm({
      ...form,
      preferences: form.preferences.includes(value)
        ? form.preferences.filter((p) => p !== value)
        : [...form.preferences, value],
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nights < 1) {
      setError("Check-out must be at least one day after check-in.");
      return;
    }

    const criteria = {
      ...form,
      guests: Number(form.guests),
      budget: Number(form.budget),
    };
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/v1/recommendations", {
        destination: criteria.destination,
        budget: criteria.budget,
        purpose: criteria.purpose,
        preferences: criteria.preferences,
      });
      setSearch(criteria);
      setResults(data.results);
      navigate("/results");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="search">
      <div className="search-intro">
        <h1>Where are you going, and why?</h1>
        <p>
          Tell us why you're travelling and what you need. We rank hotels by how
          well they fit.
        </p>
      </div>

      <form className="panel search-form" onSubmit={handleSubmit}>
        <div className="field wide">
          <label htmlFor="destination">Destination</label>
          <input
            id="destination"
            value={form.destination}
            onChange={update("destination")}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="checkIn">Check-in</label>
          <input
            id="checkIn"
            type="date"
            value={form.checkIn}
            onChange={update("checkIn")}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="checkOut">Check-out</label>
          <input
            id="checkOut"
            type="date"
            value={form.checkOut}
            onChange={update("checkOut")}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="guests">Guests</label>
          <input
            id="guests"
            type="number"
            min="1"
            max="10"
            value={form.guests}
            onChange={update("guests")}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="budget">Budget per night (₹)</label>
          <input
            id="budget"
            type="number"
            min="500"
            step="100"
            value={form.budget}
            onChange={update("budget")}
            required
          />
        </div>

        {nights > 0 && (
          <p className="hint wide">
            {nights} {nights === 1 ? "night" : "nights"}
          </p>
        )}

        <fieldset className="field wide">
          <legend>Purpose of trip</legend>
          <div className="options">
            {PURPOSES.map((p) => {
              const selected = form.purpose === p.value;
              return (
                <label
                  key={p.value}
                  className={selected ? "option selected" : "option"}
                >
                  <input
                    type="radio"
                    name="purpose"
                    value={p.value}
                    checked={selected}
                    onChange={update("purpose")}
                  />
                  {p.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="field wide">
          <legend>Must-haves</legend>
          <div className="options">
            {AMENITIES.map((a) => {
              const selected = form.preferences.includes(a.value);
              return (
                <label
                  key={a.value}
                  className={selected ? "option selected" : "option"}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => togglePreference(a.value)}
                  />
                  {selected && (
                    <CheckIcon size={14} weight="bold" aria-hidden="true" />
                  )}
                  {a.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p className="error wide" role="alert">
            {error}
          </p>
        )}

        <button className="btn primary wide" disabled={loading}>
          {loading ? "Finding hotels…" : "Find hotels"}
        </button>
      </form>
    </section>
  );
}
