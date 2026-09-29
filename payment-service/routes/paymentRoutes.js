const express = require("express");
const Payment = require("../models/Payment");

const router = express.Router();

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find();

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
});

// GET payment by ID
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
});

// CREATE / PROCESS PAYMENT
router.post("/", async (req, res) => {
  try {
    const { bookingId, amount, simulateFailure = false } = req.body;

    if (!bookingId || amount === undefined) {
      return res.status(400).json({
        message: "bookingId and amount are required",
      });
    }

    if (simulateFailure) {
      const failedPayment = await Payment.create({
        bookingId,
        amount,
        status: "FAILED",
      });

      return res.status(402).json({
        message: "Payment failed",
        payment: failedPayment,
      });
    }

    const transactionId = `TXN-${Date.now()}`;

    const payment = await Payment.create({
      bookingId,
      amount,
      status: "SUCCESS",
      transactionId,
    });

    res.status(201).json({
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Payment processing failed",
      error: error.message,
    });
  }
});

module.exports = router;
