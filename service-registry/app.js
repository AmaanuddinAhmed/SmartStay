const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "Service Registry",
    status: "UP",
  });
});

const PORT = 5005;

app.listen(PORT, () => {
  console.log(`Service Registry running on port ${PORT}`);
});
