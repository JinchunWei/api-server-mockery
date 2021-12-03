const got = require("got");
const clients = require("../clients.js");
const logic = require("../logic.js");

jest.mock("../clients.js");

const baseUri = "http://localhost:1227";
let http;

beforeEach(async () => {
  http = got.extend({
    prefixUrl: baseUri,
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
  "setup endpoint mocking",
  async (
    path,
    method,
    headers,
    // eslint-disable-next-line unicorn/prevent-abbreviations
    searchParams,
    body,
    responseCode,
    responseHeaders,
    responseBody
  ) => {
    // When
    logic.configure({ baseUri });
    logic.mockEndpoint({
      path: `/${path}`,
      method,
      headers,
      searchParams,
      body,
      reply: { responseCode, headers: responseHeaders, body: responseBody },
    });

    // Then
    const response = await http(path, {
      method,
      headers,
      searchParams,
      body,
    });

    expect(response.statusCode).toEqual(responseCode);
    expect(response.headers).toMatchObject(responseHeaders);
    expect(response.body).toEqual(responseBody || "");
  }
);

test.each([undefined, 0, 1, 2])(
  "mock endpoint for specified times",
  async (times) => {
    // When
    logic.configure({ baseUri });
    logic.mockEndpoint({
      path: "/target",
      method: "get",
      times,
      reply: { responseCode: 204 },
    });

    // Then
    await http.get("target");
    if (times > 1) {
      for (let index = 1; index < times; index++) await http.get("target");
    }
    const promise = http.get("target");

    await expect(promise).toReject();
  }
);

test("mock endpoint permanently", async () => {
  // When
  logic.configure({ baseUri });
  logic.mockEndpoint({
    path: "/target",
    method: "get",
    persist: true,
    reply: { responseCode: 204 },
  });

  // Then
  await http.get("target");
  await http.get("target");
  const promise = http.get("target");

  await expect(promise).toResolve();
});

test.each([
  [{ a: "1" }, { b: 2 }],
  [{ c: { d: "4" } }, { e: ["abc"] }],
])("retrieved response from clients layer", async (request, result) => {
  // Given
  clients.invokeRequest.mockResolvedValue(result);

  // When
  const actualResult = await logic.handleRequest(request);

  // Then
  expect(actualResult).toEqual(result);
  expect(clients.invokeRequest).toBeCalledWith(request);
});

test("clean up mocking", async () => {
  const headers = { first: "header" };
  // eslint-disable-next-line unicorn/prevent-abbreviations
  const searchParams = { search: "parameter" };
  const json = {
    method: "get",
    path: "/path",
    headers,
    searchParams,
    reply: { responseCode: 200, headers: {}, body: { return: "value" } },
  };

  // Given
  logic.configure({ baseUri });
  logic.mockEndpoint(json);

  // When
  logic.clearMocking();

  // Then
  const promise = http.get("path", { headers, searchParams });

  await expect(promise).toReject();
});

afterEach(jest.restoreAllMocks);
