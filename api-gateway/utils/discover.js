const axios = require("axios");

const discover = async (serviceName) => {
  const registryUrl = process.env.REGISTRY_URL || "http://localhost:5005";

  try {
    const { data } = await axios.get(
      `${registryUrl}/api/v1/registry/services/${serviceName}`,
      { timeout: 2000 },
    );
    return data.url;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`${serviceName} is not registered`);
    }
    throw new Error("Service Registry unreachable");
  }
};

module.exports = discover;
