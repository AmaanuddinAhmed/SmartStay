const axios = require("axios");

const HEARTBEAT_MS = 30000;

const registerService = (name, port) => {
  const registryUrl = process.env.REGISTRY_URL || "http://localhost:5005";
  const url = `http://localhost:${port}`;
  let registered = false;

  const register = async () => {
    try {
      await axios.post(
        `${registryUrl}/api/v1/registry/register`,
        { name, url },
        { timeout: 2000 },
      );
      if (!registered)
        console.log(`[${name}] Registered with Service Registry`);
      registered = true;
    } catch (error) {
      if (registered || registered === false) {
        console.warn(
          `[${name}] Registry unreachable, retrying in ${HEARTBEAT_MS / 1000}s`,
        );
      }
      registered = false;
    }
  };

  register();
  setInterval(register, HEARTBEAT_MS);
};

module.exports = registerService;
