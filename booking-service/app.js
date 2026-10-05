const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const bookingRoutes = require("./routes/bookingRoutes");
const registerService = require("./utils/registerService");
const bookingRoutesV2 = require("./routes/v2/bookingRoutes");
const paymentBreaker = require("./utils/paymentBreaker");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "Booking Service",
    status: "UP",
  });
});

// Circuit Breaker status
app.get("/api/v1/circuit-status", (req, res) => {
  res.json(paymentBreaker.getStatus());
});

// API routes
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v2/bookings", bookingRoutesV2);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Booking Service running on port ${PORT}`);
    registerService("booking-service", PORT);
  });
};

startServer();
