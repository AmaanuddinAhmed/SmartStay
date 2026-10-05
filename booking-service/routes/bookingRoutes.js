const express = require("express");
const Booking = require("../models/Booking");
const prepareBooking = require("../utils/prepareBooking");
const axios = require("axios");
const discover = require("../utils/discover");
const mongoose = require("mongoose");

const router = express.Router();

router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id format" });
  }
  next();
});

// GET all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// GET booking by ID
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
});

// CREATE booking (validated via Hotel Service)
router.post("/", async (req, res) => {
  try {
    const bookingData = await prepareBooking(req.body);
    const booking = await Booking.create(bookingData);

    res.status(201).json(booking);
  } catch (error) {
    res.status(error.status || 400).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

// UPDATE booking
router.put("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "PENDING") {
      return res.status(409).json({
        message: `A ${booking.status} booking cannot be modified`,
      });
    }

    const {
      checkIn = booking.checkIn,
      checkOut = booking.checkOut,
      guests = booking.guests,
    } = req.body;

    const updated = await prepareBooking({
      userId: booking.userId,
      hotelId: booking.hotelId,
      roomId: booking.roomId,
      checkIn,
      checkOut,
      guests,
    });

    booking.checkIn = updated.checkIn;
    booking.checkOut = updated.checkOut;
    booking.guests = updated.guests;
    booking.totalAmount = updated.totalAmount;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(error.status || 400).json({
      message: "Failed to update booking",
      error: error.message,
    });
  }
});

// CANCEL booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(409).json({ message: "Booking is already cancelled" });
    }

    if (booking.status === "CONFIRMED") {
      try {
        const hotelServiceUrl = await discover("hotel-service");
        await axios.put(
          `${hotelServiceUrl}/api/v1/rooms/${booking.roomId}/release`,
          null,
          { timeout: 3000 },
        );
      } catch (error) {
        return res.status(503).json({
          message: "Room could not be released. Booking was not cancelled.",
          error: error.message,
        });
      }
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
});

module.exports = router;
