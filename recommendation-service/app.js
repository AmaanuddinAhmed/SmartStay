const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "Recommendation Service",
    status: "UP",
  });
});

app.use("/api/v1/recommendations", recommendationRoutes);

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Recommendation Service running on port ${PORT}`);
  });
};

startServer();
