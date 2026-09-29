const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.json({
        service: "Booking Service",
        status: "UP"
    });
});

// API routes
app.use("/api/v1/bookings", bookingRoutes);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Booking Service running on port ${PORT}`);
    });
};

startServer();