const clients = require("../clients.js");
const config = require("../config.js");
const logic = require("../logic.js");
const server = require("../server.js");

jest.mock("../clients.js");
jest.mock("../server.js");
jest.mock("../logic.js");

test.each([undefined, 1025])(
  "retrieves listening port from environment",
  (value) => {
    config.configure({ LISTENING_PORT: value?.toString() });

    expect(server.configure).toBeCalledWith({ port: value || 8080 });
  }
);

test.each([undefined, "http://1.2.3.4:1234", "https://access.logic/path"])(
  "retrieves API mock base-uri from environment",
  (value) => {
    config.configure({ MOCK_BASE_URI: value });

    const defaultUri = "http://localhost:1227";
    expect(logic.configure).toBeCalledWith({ baseUri: value || defaultUri });
    expect(clients.configure).toBeCalledWith({ baseUri: value || defaultUri });
  }
);

afterEach(() => {
  jest.resetAllMocks();
});
