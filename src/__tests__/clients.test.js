const nock = require("nock");
const clients = require("../clients.js");

test.each([
  [
    "http://localhost",
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
    "https://some.where",
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
    "http://some.host:1234",
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
    "http://good.svr/base_path",
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
  "retrieves response from mocking server",
  async (
    baseUri,
    path,
    method,
    headers,
    query,
    body,
    responseCode,
    responseHeaders,
    responseBody
  ) => {
    // Given
    const interceptor = nock(baseUri)[method](`/${path}`, body).query(query);
    for (const [key, value] of Object.entries(headers))
      interceptor.matchHeader(key, value);
    interceptor.reply(responseCode, responseBody, responseHeaders);

    // Given
    clients.configure({ baseUri });
    const result = await clients.invokeRequest({
      path,
      method,
      headers,
      searchParams: query,
      body,
    });

    // Then
    expect(result.statusCode).toEqual(responseCode);
    expect(result.headers).toMatchObject(responseHeaders);
    expect(result.body).toEqual(responseBody || "");
  }
);

afterEach(nock.cleanAll);
