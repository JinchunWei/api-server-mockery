const got = require("got");
const config = require("../config.js");
const server = require("../server.js");

jest.setTimeout(10_000);
let http;
const portNumber = "9863";
const prefixUrl = `http://localhost:${portNumber}`;

beforeEach(async () => {
  http = got.extend({
    retry: 0,
    throwHttpErrors: false,
  });
});

test(`Given an endpoint is setup with a mocked response, when I send request to
 the mocked endpoint, then I should receive the mocked response.`, async () => {
  const method = "post";
  const path = "path/to/endpoint";
  const requestHeaders = { a: "b" };
  const queryParameters = { c: "d" };
  const requestBody = "some body content";
  const responseCode = 200;
  const responseHeaders = { e: "f" };
  const responseBody = "nice response";

  config.configure({ MOCK_BASE_URI: prefixUrl, LISTENING_PORT: portNumber });
  await server.start();

  const { statusCode: mockResultStatus } = await http.post("mocking", {
    prefixUrl,
    json: {
      method,
      path: `/${path}`,
      headers: requestHeaders,
      searchParams: queryParameters,
      body: requestBody,
      reply: {
        responseCode,
        body: responseBody,
        headers: responseHeaders,
      },
    },
  });
  expect(mockResultStatus).toBe(204);

  const result = await http[method](path, {
    prefixUrl,
    headers: { ...requestHeaders, "user-agent": "spec-test" },
    searchParams: queryParameters,
    body: requestBody,
  });

  expect(result.statusCode).toEqual(responseCode);
  expect(result.headers).toEqual(responseHeaders);
  expect(result.body).toEqual(responseBody);
});

afterEach(async () => await server.stop());
