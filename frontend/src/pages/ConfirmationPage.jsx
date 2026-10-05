import { Link, useLocation } from "react-router-dom";
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  ProhibitIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { formatDate, formatINR } from "../constants";

const STEP_LABELS = {
  PAYMENT_CIRCUIT_CHECK: "Payment availability check",
  VALIDATE: "Room and date check",
  CREATE_BOOKING: "Pending booking",
  RESERVE_ROOM: "Room reservation",
  PROCESS_PAYMENT: "Payment",
  CONFIRM_BOOKING: "Booking confirmation",
  "COMPENSATE: RELEASE_ROOM": "Room release (rollback)",
  "COMPENSATE: CANCEL_BOOKING": "Booking cancellation (rollback)",
  "COMPENSATE: REFUND_PAYMENT": "Payment refund (rollback)",
};

const STATUS_TEXT = {
  SUCCESS: "succeeded",
  FAILED: "failed",
  REJECTED: "rejected",
};

const STEP_ICONS = {
  done: CheckCircleIcon,
  failed: XCircleIcon,
  rejected: ProhibitIcon,
  compensation: ArrowCounterClockwiseIcon,
};

const stepKind = ({ step, status }) => {
  if (status !== "SUCCESS") return status.toLowerCase();
  return step.startsWith("COMPENSATE") ? "compensation" : "done";
};

export default function ConfirmationPage() {
  const { state } = useLocation();

  if (!state?.result) {
    return (
      <section className="empty">
        <h1>Nothing to show yet</h1>
        <p>Your booking result appears here after you pay.</p>
        <Link className="btn primary" to="/">
          Find hotels
        </Link>
      </section>
    );
  }

  const { result, hotel, room } = state;
  const booking = result.data;
  const ok = result.success;
  const OutcomeIcon = ok ? CheckCircleIcon : XCircleIcon;

  return (
    <section>
      <div className={ok ? "outcome" : "outcome failed"}>
        <span className="outcome-icon">
          <OutcomeIcon size={40} weight="fill" aria-hidden="true" />
        </span>
        <div>
          <h1>{ok ? "Booking confirmed" : "Booking not completed"}</h1>
          <p className="muted">
            {ok
              ? `Your ${room.roomType} room at ${hotel.name} is booked.`
              : result.message}
          </p>
        </div>
      </div>

      <div className="confirm-grid">
        <div className="panel">
          {booking ? (
            <>
              <h2>Booking details</h2>
              <dl className="summary">
                <dt>Booking ID</dt>
                <dd className="mono">{booking.id}</dd>
                <dt>Status</dt>
                <dd>{booking.status}</dd>
                <dt>Hotel</dt>
                <dd>{hotel.name}</dd>
                <dt>Room</dt>
                <dd>{room.roomType}</dd>
                <dt>Dates</dt>
                <dd>
                  {formatDate(booking.stay.checkIn)} to{" "}
                  {formatDate(booking.stay.checkOut)}
                </dd>
                <dt>Amount</dt>
                <dd>{formatINR(booking.totalAmount)}</dd>
                {result.payment?.transactionId && (
                  <>
                    <dt>Transaction</dt>
                    <dd className="mono">{result.payment.transactionId}</dd>
                  </>
                )}
              </dl>
            </>
          ) : (
            <>
              <h2>No booking was created</h2>
              <p className="muted">
                Payments were unavailable, so the booking never started.
              </p>
            </>
          )}
        </div>

        <div className="panel">
          <h2>What happened behind the scenes</h2>
          <p className="hint">
            Each step of the booking Saga, coordinated by Booking Service.
          </p>
          <ol className="saga">
            {result.saga.map((s, i) => {
              const kind = stepKind(s);
              const Icon = STEP_ICONS[kind];
              return (
                <li key={i} className={kind} style={{ "--i": i }}>
                  <span className="step-icon">
                    <Icon size={22} weight="fill" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="step-name">
                      {STEP_LABELS[s.step] || s.step}
                    </span>{" "}
                    <span className="step-status">
                      {STATUS_TEXT[s.status] || s.status}
                    </span>
                    <span className="step-detail mono">
                      {s.step}
                      {s.detail ? `: ${s.detail}` : ""}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="actions">
        {!ok && (
          <Link className="btn primary" to="/book" state={{ hotel, room }}>
            Try again
          </Link>
        )}
        <Link className="text-link" to="/">
          New search
        </Link>
      </div>
    </section>
  );
}
