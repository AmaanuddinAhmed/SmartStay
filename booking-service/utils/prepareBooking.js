const axios = require("axios");
const mongoose = require("mongoose");
const discover = require("./discover");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Validates a booking request against Hotel Service and computes totalAmount.
// Reused by v1 create and (later) the v2 Saga.
const prepareBooking = async ({
  userId,
  hotelId,
  roomId,
  checkIn,
  checkOut,
  guests,
}) => {
  if (!userId || !hotelId || !roomId || !checkIn || !checkOut || !guests) {
    throw httpError(
      400,
      "userId, hotelId, roomId, checkIn, checkOut and guests are required",
    );
  }

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw httpError(400, "Invalid roomId format");
  }

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isNaN(inDate) || isNaN(outDate)) {
    throw httpError(400, "Invalid checkIn or checkOut date");
  }

  const nights = Math.round((outDate - inDate) / MS_PER_DAY);
  if (nights < 1) {
    throw httpError(400, "checkOut must be at least one day after checkIn");
  }

  // Inter-service call: Booking → Hotel (via registry)
  let room;
  try {
    const hotelServiceUrl = await discover("hotel-service");
    const { data } = await axios.get(
      `${hotelServiceUrl}/api/v1/rooms/${roomId}`,
      {
        timeout: 3000,
      },
    );
    room = data;
  } catch (error) {
    if (error.response?.status === 404) throw httpError(404, "Room not found");
    if (error.response) throw httpError(502, "Hotel Service returned an error");
    throw httpError(503, `Hotel Service unavailable: ${error.message}`);
  }

  if (String(room.hotelId) !== String(hotelId)) {
    throw httpError(400, "Room does not belong to this hotel");
  }

  if (guests > room.capacity) {
    throw httpError(400, `Room capacity is ${room.capacity} guests`);
  }

  return {
    userId,
    hotelId,
    roomId,
    checkIn: inDate,
    checkOut: outDate,
    guests,
    totalAmount: room.pricePerNight * nights,
  };
};

module.exports = prepareBooking;
