const express = require("express");
const axios = require("axios");
const Recommendation = require("../models/Recommendation");
const scoreHotel = require("../utils/scoreHotel");
const discover = require("../utils/discover");
const mongoose = require("mongoose");

const router = express.Router();

router.param("id", (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id format" });
  }
  next();
});

// GET recommendation logs
router.get("/", async (req, res) => {
  try {
    const logs = await Recommendation.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch logs", error: error.message });
  }
});

// POST get recommendations
router.post("/", async (req, res) => {
  const { destination, budget, purpose, preferences = [] } = req.body || {};

  if (budget === undefined || !purpose) {
    return res.status(400).json({ message: "budget and purpose are required" });
  }

  if (
    typeof purpose !== "string" ||
    isNaN(Number(budget)) ||
    !Array.isArray(preferences) ||
    (destination !== undefined && typeof destination !== "string")
  ) {
    return res.status(400).json({
      message:
        "budget must be a number, purpose and destination text, preferences a list",
    });
  }

  // Fetch hotels from Hotel Service (HTTP, not its DB)
  let hotels;
  try {
    const hotelServiceUrl = await discover("hotel-service");
    const response = await axios.get(`${hotelServiceUrl}/api/v1/hotels`, {
      timeout: 3000,
    });
    hotels = response.data;
  } catch (error) {
    return res.status(503).json({
      message: "Hotel Service unavailable",
      error: error.message,
    });
  }

  if (destination) {
    hotels = hotels.filter((h) =>
      h.location.toLowerCase().includes(destination.toLowerCase()),
    );
  }

  const results = hotels
    .map((hotel) => {
      const { score, reasons } = scoreHotel(hotel, {
        budget,
        purpose,
        preferences,
      });
      return {
        hotelId: hotel._id,
        name: hotel.name,
        location: hotel.location,
        pricePerNight: hotel.priceRange,
        rating: hotel.rating,
        imageUrl: hotel.imageUrl,
        matchScore: score,
        reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  // Logging should never block the response
  try {
    await Recommendation.create({
      userPreferences: { destination, budget, purpose, preferences },
      results: results.map((r) => ({
        hotelId: r.hotelId,
        score: r.matchScore,
        reasons: r.reasons,
      })),
    });
  } catch (error) {
    console.error("Failed to log recommendation:", error.message);
  }

  res.json({ count: results.length, results });
});

module.exports = router;
