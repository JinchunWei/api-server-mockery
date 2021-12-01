const got = require("got");
const logic = require("../logic.js");
const server = require("../server.js");

jest.mock("../logic.js");

const PORT_NUMBER = 9871;
let client;

beforeEach(async () => {
  server.configure({ port: PORT_NUMBER });
  await server.start();
  client = got.extend({
    prefixUrl: `http://localhost:${PORT_NUMBER}`,
    retry: 0,
    throwHttpErrors: false,
  });
});

test.each([
  [
    "",
    "get",
    { hkey1: "hv1", "content-type": "text/plain" },
    { sp1: "spv1" },
    undefined,
    200,
    { rhk1: "rhv1" },
    "text response",
  ],
  [
    "path",
    "post",
    { hkey2: "hv2", "content-type": "application/xml" },
    { sp2: "spv2" },
    "<xml><a>2333</a></xml>",
    400,
    { rhk2: "rhv2" },
    "<xml><b><c>value</c></b></xml>",
  ],
  [
    "some/longer/path",
    "put",
    { hkey3: "hv3", "content-type": "application/json" },
    { sp3: "spv3" },
    JSON.stringify({ f: "6" }),
    502,
    { rhk3: "rhv3" },
    JSON.stringify({ e: "5" }),
  ],
  [
    "one/more/path",
    "delete",
    { hkey4: "hv4", "content-type": "application/json" },
    { sp4: "spv4" },
    JSON.stringify({ f: "6" }),
    504,
    { rhk4: "rhv4" },
    undefined,
  ],
])(
  "provides response from logic layer",
  async (
    path,
    method,
    headers,
    // eslint-disable-next-line unicorn/prevent-abbreviations
    searchParams,
    body,
    statusCode,
    responseHeaders,
    responseBody
  ) => {
    // Given
    logic.handleRequest.mockResolvedValue({
      statusCode,
      headers: responseHeaders,
      body: responseBody,
    });

    // When
    const response = await client(path, {
      method,
      headers,
      searchParams,
      body,
    });

    // Then
    expect(response.statusCode).toBe(statusCode);
    expect(response.headers).toMatchObject(responseHeaders);
    expect(response.body).toEqual(responseBody || "");
    expect(logic.handleRequest).toBeCalledWith({
      path: `/${path}`,
      method: expect.stringMatching(new RegExp(method, "i")),
      headers: expect.objectContaining(headers),
      searchParams,
      body: body || {},
    });
  }
);

test.each([
  [
    "",
    "get",
    { hkey1: "hv1", "content-type": "text/plain" },
    { sp1: "spv1" },
    undefined,
    200,
    { rhk1: "rhv1" },
    "text response",
  ],
  [
    "path",
    "post",
    { hkey2: "hv2", "content-type": "application/xml" },
    { sp2: "spv2" },
    "<xml><a>2333</a></xml>",
    400,
    { rhk2: "rhv2" },
    "<xml><b><c>value</c></b></xml>",
  ],
  [
    "some/longer/path",
    "put",
    { hkey3: "hv3", "content-type": "application/json" },
    { sp3: "spv3" },
    JSON.stringify({ f: "6" }),
    502,
    { rhk3: "rhv3" },
    JSON.stringify({ e: "5" }),
  ],
  [
    "one/more/path",
    "delete",
    { hkey4: "hv4", "content-type": "application/json" },
    { sp4: "spv4" },
    JSON.stringify({ f: "6" }),
    504,
    { rhk4: "rhv4" },
    undefined,
  ],
])(
  "handles mocking request via logic layer",
  async (
    path,
    method,
    headers,
    // eslint-disable-next-line unicorn/prevent-abbreviations
    searchParams,
    body,
    statusCode,
    responseHeaders,
    responseBody
  ) => {
    const json = {
      method,
      path,
      headers,
      searchParams,
      body,
      reply: {
        responseCode: statusCode,
        headers: responseHeaders,
        body: responseBody,
      },
    };

    // Given
    logic.mockEndpoint.mockResolvedValue();

    // When
    const response = await client.post("mocking", {
      json,
    });

    // Then
    expect(response.statusCode).toBe(204);
    expect(logic.mockEndpoint).toBeCalledWith(json);
    expect(logic.handleRequest).not.toBeCalled();
  }
);

test("clear mocking", async () => {
  // Given
  logic.clearMocking.mockResolvedValue();

  // When
  const response = await client.delete("mocking");

  // Then
  expect(response.statusCode).toBe(204);
  expect(logic.clearMocking).toBeCalled();
});

afterEach(async () => {
  await server.stop();
  jest.resetAllMocks();
});
