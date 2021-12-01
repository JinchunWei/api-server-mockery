const configEnv = require("@jitsusama/config-env-js");
const clients = require("./clients.js");
const logic = require("./logic.js");
const server = require("./server.js");

/**
 * Loads configuration from the system environment.
 * @param {Record<string, string>} environment - system environment
 */
const configure = (environment) => {
  const config = new configEnv.Environment({
    environment,
    logs: { layer: "config" },
  });

  const port = config.getUnprivilegedPort("LISTENING_PORT", 8080);
  const baseUri = config.getUrl("MOCK_BASE_URI", "http://localhost:1227");

  server.configure({ port });
  logic.configure({ baseUri });
  clients.configure({ baseUri });
};

module.exports = { configure };
