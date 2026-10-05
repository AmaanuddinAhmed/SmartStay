const axios = require("axios");
const Booking = require("../models/Booking");
const discover = require("../utils/discover");
const prepareBooking = require("../utils/prepareBooking");
const paymentBreaker = require("../utils/paymentBreaker");

const callService = async (serviceName, method, path, data) => {
  const baseUrl = await discover(serviceName);
  return axios({ method, url: `${baseUrl}${path}`, data, timeout: 5000 });
};

const reason = (error) => error.response?.data?.message || error.message;

// ---------- Compensating actions ----------

const releaseRoom = async (booking, log) => {
  try {
    await callService(
      "hotel-service",
      "put",
      `/api/v1/rooms/${booking.roomId}/release`,
    );
    log("COMPENSATE: RELEASE_ROOM", "SUCCESS");
  } catch (error) {
    log(
      "COMPENSATE: RELEASE_ROOM",
      "FAILED",
      `${reason(error)} — needs manual release`,
    );
  }
};

const cancelBooking = async (booking, log) => {
  try {
    booking.status = "CANCELLED";
    await booking.save();
    log("COMPENSATE: CANCEL_BOOKING", "SUCCESS");
  } catch (error) {
    log("COMPENSATE: CANCEL_BOOKING", "FAILED", error.message);
  }
};

// ---------- Saga ----------

const runBookingSaga = async (input) => {
  const steps = [];
  const log = (step, status, detail = "") => {
    steps.push({ step, status, ...(detail && { detail }) });
    console.log(`[Saga] ${step}: ${status}${detail ? " — " + detail : ""}`);
  };

  // Fallback: if Payment circuit is OPEN, don't start the saga at all
  if (!paymentBreaker.canRequest()) {
    const { retryInSeconds } = paymentBreaker.getStatus();
    log(
      "PAYMENT_CIRCUIT_CHECK",
      "REJECTED",
      `circuit OPEN, retry in ${retryInSeconds}s`,
    );
    return {
      ok: false,
      status: 503,
      message: `Payments are temporarily unavailable. Please try again in ${retryInSeconds} seconds.`,
      booking: null,
      steps,
    };
  }

  // Step 0: Validate via Hotel Service (throws → nothing to undo)
  const bookingData = await prepareBooking(input);
  log("VALIDATE", "SUCCESS", `totalAmount ${bookingData.totalAmount}`);

  // Step 1: Create PENDING booking
  const booking = await Booking.create({ ...bookingData, status: "PENDING" });
  log("CREATE_BOOKING", "SUCCESS", `bookingId ${booking._id}`);

  // Step 2: Reserve room
  try {
    await callService(
      "hotel-service",
      "put",
      `/api/v1/rooms/${booking.roomId}/reserve`,
    );
    log("RESERVE_ROOM", "SUCCESS");
  } catch (error) {
    log("RESERVE_ROOM", "FAILED", reason(error));
    // Room was never reserved by us → do NOT release it
    await cancelBooking(booking, log);
    return {
      ok: false,
      status: error.response?.status === 409 ? 409 : 503,
      message: "Room could not be reserved. Booking cancelled.",
      booking,
      steps,
    };
  }

  // Step 3: Process payment
  let payment;
  try {
    const { data } = await paymentBreaker.fire(() =>
      callService("payment-service", "post", "/api/v1/payments", {
        bookingId: String(booking._id),
        amount: booking.totalAmount,
        simulateFailure: input.simulateFailure === true,
      }),
    );
    payment = data.payment;
    log("PROCESS_PAYMENT", "SUCCESS", payment.transactionId);
  } catch (error) {
    log("PROCESS_PAYMENT", "FAILED", reason(error));
    await releaseRoom(booking, log);
    await cancelBooking(booking, log);
    return {
      ok: false,
      status: error.response?.status === 402 ? 402 : 503,
      message: "Payment failed. Room released and booking cancelled.",
      booking,
      steps,
    };
  }

  // Step 4: Confirm booking
  booking.status = "CONFIRMED";
  await booking.save();
  log("CONFIRM_BOOKING", "SUCCESS");

  return {
    ok: true,
    status: 201,
    message: "Booking confirmed",
    booking,
    payment,
    steps,
  };
};

module.exports = runBookingSaga;
