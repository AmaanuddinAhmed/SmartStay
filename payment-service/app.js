const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "Payment Service",
    status: "UP",
  });
});

app.use("/api/v1/payments", paymentRoutes);

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Payment Service running on port ${PORT}`);
  });
};

startServer();
