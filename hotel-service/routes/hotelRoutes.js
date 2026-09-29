const express = require("express");
const Hotel = require("../models/Hotel");

const router = express.Router();

// GET all hotels
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();

    res.json(hotels);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch hotels",
      error: error.message,
    });
  }
});

// GET one hotel
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    res.json(hotel);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch hotel",
      error: error.message,
    });
  }
});

// CREATE hotel
router.post("/", async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create hotel",
      error: error.message,
    });
  }
});

// UPDATE hotel
router.put("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    res.json(hotel);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update hotel",
      error: error.message,
    });
  }
});

// DELETE hotel
router.delete("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    res.json({
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete hotel",
      error: error.message,
    });
  }
});

module.exports = router;
