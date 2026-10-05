const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// In-memory registry: { name: { name, url, registeredAt, lastHeartbeat } }
const services = {};
const STALE_MS = 90000;

const pruneStale = () => {
  const now = Date.now();
  for (const name in services) {
    if (now - services[name].lastHeartbeat > STALE_MS) {
      console.log(`Removed stale service: ${name}`);
      delete services[name];
    }
  }
};

setInterval(pruneStale, 30000);

app.get("/health", (req, res) => {
  res.json({ service: "Service Registry", status: "UP" });
});

// REGISTER / HEARTBEAT
app.post("/api/v1/registry/register", (req, res) => {
  const { name, url } = req.body;

  if (!name || !url) {
    return res.status(400).json({ message: "name and url are required" });
  }

  const isNew = !services[name];

  services[name] = {
    name,
    url,
    registeredAt: isNew
      ? new Date().toISOString()
      : services[name].registeredAt,
    lastHeartbeat: Date.now(),
  };

  if (isNew) console.log(`Registered: ${name} → ${url}`);

  res.json({
    message: isNew ? "Service registered" : "Heartbeat received",
    service: services[name],
  });
});

// GET all services
app.get("/api/v1/registry/services", (req, res) => {
  pruneStale();
  res.json(Object.values(services));
});

// DISCOVER one service
app.get("/api/v1/registry/services/:name", (req, res) => {
  pruneStale();
  const service = services[req.params.name];

  if (!service) {
    return res
      .status(404)
      .json({ message: `Service '${req.params.name}' not found` });
  }

  res.json(service);
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Service Registry running on port ${PORT}`);
});
