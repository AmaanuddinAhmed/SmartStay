const express = require("express");
const Booking = require("../../models/Booking");
const runBookingSaga = require("../../saga/bookingSaga"); 
const mongoose = require("mongoose");

const router = express.Router(); 

router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id format" });
  }
  next();
});

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// v2 response shape
const toV2 = (b) => ({
  id: b._id,
  userId: b.userId,
  hotelId: b.hotelId,
  roomId: b.roomId,
  stay: {
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: Math.round((b.checkOut - b.checkIn) / MS_PER_DAY),
  },
  guests: b.guests,
  totalAmount: b.totalAmount,
  status: b.status,
  createdAt: b.createdAt,
});

// GET all bookings (v2 format)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({
      apiVersion: "v2",
      count: bookings.length,
      data: bookings.map(toV2),
    });
  } catch (error) {
    res.status(500).json({
      apiVersion: "v2",
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

// GET booking by ID (v2 format)
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ apiVersion: "v2", message: "Booking not found" });
    }
    res.json({ apiVersion: "v2", data: toV2(booking) });
  } catch (error) {
    res.status(500).json({
      apiVersion: "v2",
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
});

// CREATE booking via Saga
router.post("/", async (req, res) => {
  try {
    const result = await runBookingSaga(req.body || {});

    res.status(result.status).json({
      apiVersion: "v2",
      success: result.ok,
      message: result.message,
      data: result.booking ? toV2(result.booking) : null,
      ...(result.payment && { payment: result.payment }),
      saga: result.steps,
    });
  } catch (error) {
    // Validation failed before any booking was created
    res.status(error.status || 500).json({
      apiVersion: "v2",
      success: false,
      message: "Booking could not be started",
      error: error.message,
    });
  }
});

module.exports = router;
