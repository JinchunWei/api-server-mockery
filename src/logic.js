const log = require("@jitsusama/logging-js").getLogger("logic");
const nock = require("nock");
const clients = require("./clients.js");

let mockBaseUri;

/**
 * Configure this layer.
 * @param {object} options
 * @param {string} options.baseUri - BaseUri of mocking API
 */
const configure = ({ baseUri }) => {
  mockBaseUri = baseUri;
};

/**
 * Handle any request from server layer
 * @Param {object} request - Request object
 */
const handleRequest = async (request) => {
  return await clients.invokeRequest(request);
};

/**
 * Setup mocking endpoint.
 */
const mockEndpoint = (request) => {
  const { path, method, headers, times, persist, searchParams, body, reply } =
    request;
  const { responseCode, headers: responseHeaders, body: responseBody } = reply;

  const scope = nock(mockBaseUri);
  if (persist) scope.persist();
  const interceptor = scope[method](path, body);
  if (searchParams) interceptor.query(searchParams);
  if (times) interceptor.times(times);
  if (headers)
    for (const [key, value] of Object.entries(headers))
      interceptor.matchHeader(key, value);
  interceptor.reply(responseCode, responseBody, responseHeaders);

  log.info(
    { path, method, headers, searchParams, body, reply },
    "successfully mocked endpoint"
  );
};

const clearMocking = () => {
  nock.cleanAll();
};

module.exports = { configure, handleRequest, mockEndpoint, clearMocking };
