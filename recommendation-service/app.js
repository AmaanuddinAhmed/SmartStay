const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "Recommendation Service",
    status: "UP",
  });
});

const PORT = 5004;

app.listen(PORT, () => {
  console.log(`Recommendation Service running on port ${PORT}`);
});
