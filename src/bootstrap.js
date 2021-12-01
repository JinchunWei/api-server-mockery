const { createLightship } = require("lightship");
const config = require("./config.js");
const server = require("./server.js");

(async () => {
  try {
    const lightship = createLightship();
    config.configure(process.env);

    await server.start();
    lightship.signalReady();

    lightship.registerShutdownHandler(server.stop);
  } catch {
    process.exit(64);
  }
})();
