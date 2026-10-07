const axios = require("axios");

const HEARTBEAT_MS = 30000;
const RETRY_MS = 3000;

const registerService = (name, port) => {
  const registryUrl = process.env.REGISTRY_URL || "http://localhost:5005";
  const url = `http://localhost:${port}`;
  let registered = null;

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
      if (registered !== false)
        console.warn(
          `[${name}] Registry unreachable, retrying every ${RETRY_MS / 1000}s`,
        );
      registered = false;
    }

    setTimeout(register, registered ? HEARTBEAT_MS : RETRY_MS);
  };

  register();
};

module.exports = registerService;
