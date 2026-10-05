const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const discover = require("./utils/discover");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ service: "API Gateway", status: "UP" });
});

// Route table: URL prefix → service name (resolved via registry)
const ROUTES = {
  "/api/v1/hotels": "hotel-service",
  "/api/v1/rooms": "hotel-service",
  "/api/v1/bookings": "booking-service",
  "/api/v2/bookings": "booking-service",
  "/api/v1/payments": "payment-service",
  "/api/v1/recommendations": "recommendation-service",
  "/api/v1/circuit-status": "booking-service",
};

const forwardTo = (serviceName) => async (req, res) => {
  // 1. Discover service location
  let serviceUrl;
  try {
    serviceUrl = await discover(serviceName);
  } catch (error) {
    return res.status(503).json({
      message: `${serviceName} unavailable`,
      error: error.message,
    });
  }

  console.log(`[Gateway] ${req.method} ${req.originalUrl} -> ${serviceName}`);

  // 2. Forward request, pass the service's response through unchanged
  try {
    const response = await axios({
      method: req.method,
      url: `${serviceUrl}${req.originalUrl}`,
      data: req.body,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
      validateStatus: () => true,
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    const status = error.code === "ECONNABORTED" ? 504 : 503;
    res.status(status).json({
      message: `${serviceName} did not respond`,
      error: error.message,
    });
  }
};

for (const [prefix, serviceName] of Object.entries(ROUTES)) {
  app.use(prefix, forwardTo(serviceName));
}

// Unknown routes
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `No route for ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
