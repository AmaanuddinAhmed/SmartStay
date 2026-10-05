const express = require("express");
const Booking = require("../models/Booking");
const prepareBooking = require("../utils/prepareBooking");

const router = express.Router();

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
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update booking",
      error: error.message,
    });
  }
});

// CANCEL booking
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "CANCELLED" },
      { new: true },
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

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
