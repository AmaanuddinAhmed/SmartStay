import { useState } from "react";
import { Routes, Route, Link, Outlet } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import HotelPage from "./pages/HotelPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";

const daysFromToday = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
};

function NotFound() {
  return (
    <section className="empty">
      <h1>Page not found</h1>
      <p>This address doesn't match any page in SmartStay.</p>
      <Link className="btn primary" to="/">
        Find hotels
      </Link>
    </section>
  );
}

function Layout() {
  const [search, setSearch] = useState({
    destination: "Bangalore",
    checkIn: daysFromToday(7),
    checkOut: daysFromToday(9),
    guests: 2,
    budget: 5000,
    purpose: "business",
    preferences: ["wifi"],
  });
  const [results, setResults] = useState(null);

  return (
        <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <Link to="/" className="brand">
          SmartStay
        </Link>
        <span className="tagline">Hotels ranked by why you're travelling</span>
      </header>

            <main id="main">
        <Outlet context={{ search, setSearch, results, setResults }} />
      </main>

      <footer className="footer">
        Built by Team 3 as a microservices mini project.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/hotels/:id" element={<HotelPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
                <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
