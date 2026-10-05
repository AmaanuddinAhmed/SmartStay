const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    transactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Payment", paymentSchema);
