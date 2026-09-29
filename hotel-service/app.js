const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "Hotel Service",
    status: "UP",
  });
});

// API routes
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/rooms", roomRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Hotel Service running on port ${PORT}`);
  });
};

startServer();
