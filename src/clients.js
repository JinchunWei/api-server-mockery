const got = require("got");

let http;

/**
 * Configure this layer.
 * @param {object} options
 * @param {string} options.baseUri - Server base URI
 */
const configure = ({ baseUri }) => {
  http = got.extend({
    prefixUrl: baseUri,
    retry: 0,
    throwHttpErrors: false,
  });
};

/**
 * Invoke HTTP request to remote server.
 */
const invokeRequest = async (request) => {
  const { path, method, headers, searchParams, body } = request;
  return await http(path.replace(/^\/|\/$/g, ""), {
    method,
    headers,
    searchParams,
    body: method.toLowerCase() === "get" ? undefined : body,
  });
};

module.exports = {
  configure,
  invokeRequest,
};
