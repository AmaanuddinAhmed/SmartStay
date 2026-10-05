const express = require("express");
const Room = require("../models/Room");
const mongoose = require("mongoose");

const router = express.Router();

// GET all rooms (optional ?hotelId= filter)
router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.hotelId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.hotelId)) {
        return res.status(400).json({ message: "Invalid hotelId" });
      }
      filter.hotelId = req.query.hotelId;
    }

    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch rooms",
      error: error.message,
    });
  }
});

// GET room by ID
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch room",
      error: error.message,
    });
  }
});

// CREATE room
router.post("/", async (req, res) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create room",
      error: error.message,
    });
  }
});

// RESERVE room (atomic: only succeeds if currently available)
router.put("/:id/reserve", async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, available: true },
      { available: false },
      { new: true },
    );

    if (!room) {
      const exists = await Room.exists({ _id: req.params.id });
      return exists
        ? res.status(409).json({ message: "Room is already reserved" })
        : res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room reserved successfully", room });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reserve room",
      error: error.message,
    });
  }
});

// RELEASE room
router.put("/:id/release", async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { available: true },
      { new: true },
    );

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.json({
      message: "Room released successfully",
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to release room",
      error: error.message,
    });
  }
});

module.exports = router;
