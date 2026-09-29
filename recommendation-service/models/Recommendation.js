const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    userPreferences: {
      destination: String,
      budget: Number,
      purpose: String,
      preferences: [String],
    },
    results: [
      {
        _id: false,
        hotelId: String,
        score: Number,
        reasons: [String],
      },
    ],
  },
  {
    timestamps: true,
    collection: "recommendation_logs",
  },
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
