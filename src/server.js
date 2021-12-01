const {
  express,
  Server,
  requestHandler,
} = require("@jitsusama/http-server-js");
const log = require("@jitsusama/logging-js").getLogger("server");
const logic = require("./logic.js");

let server;

/**
 * Configure this layer.
 * @param {number} port - port to listen for requests on
 */
const configure = ({ port }) => {
  server = new Server({
    port,
    logs: { layer: "server" },
    routers: [
      {
        path: "",
        router: /** @type {express.Router} */ new express.Router()
          .use((request, response, next) => {
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "*");
            response.setHeader("Access-Control-Allow-Headers", "*");

            next();
          })
          .use(express.text({ type: ["json", "text", "xml"] }))
          .post("/mocking", mockingHandler)
          .delete("/mocking", cleanupHandler)
          .all(/^\/(?!mocking$).*$/, rootHandler)
          .use(errorHandler),
      },
    ],
  });
};

/** Start the server. */
const start = async () => server.start();

/** Stop the server. */
const stop = async () => server.stop();

module.exports = { configure, start, stop };

const rootHandler = requestHandler(async (request, response) => {
  const { statusCode, headers, body } = await logic.handleRequest({
    path: request.path,
    method: request.method,
    headers: request.headers,
    searchParams: request.query,
    body: request.body,
  });
  response.status(statusCode);
  for (const [key, value] of Object.entries(headers))
    response.setHeader(key, /** @type string */ value);
  response.send(body);
});

const mockingHandler = requestHandler(async (request, response) => {
  logic.mockEndpoint(JSON.parse(request.body));
  response.status(204).send();
});

const cleanupHandler = requestHandler(async (request, response) => {
  logic.clearMocking();
  response.status(204).send();
});

/** @returns {express.RequestHandler} */
const errorHandler = (error, request, response, next) => {
  log.error({ path: request.path, err: error }, "caught unexpected exception");
  response.status(500).json({ error: "unexpected error" });
  next();
};
