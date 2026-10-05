const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    amenities: {
      type: [String],
      default: [],
    },

    priceRange: {
      type: Number,
      required: true,
    },

    suitableFor: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Hotel", hotelSchema);
