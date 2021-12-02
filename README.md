# @wellvillage/api-server-mockery

![last commit badge](https://img.shields.io/github/last-commit/JinchunWei/api-server-mockery)
![package.json version badge](https://img.shields.io/github/package-json/v/JinchunWei/api-server-mockery)
[![license badge](https://img.shields.io/npm/l/@wellvillage/api-server-mockery)](./LICENSE)
![vulnerabilities badge](https://img.shields.io/snyk/vulnerabilities/npm/@wellvillage/api-server-mockery)

This is a simple HTTP server that is concerned with Mocking out an API server.
Clients of this component can setup any mock response for a target endpoint
through a special endpoint 'POST /mocking', and when the clients send the
request to the target endpoint, the mocked response before will be sent back
to the client. This can be very helpful in integrating test where an automated
test suite is the master of controlling the whole process. The test suite can
setup mock response in advance and then trigger the whole solution who may later
send requests to the mocked API server.

## Installation

You can install this module
via [NPM](https://npmjs.com/package/@wellvillage/api-server-mockery)
with `npm install @wellvillage/api-server-mockery`.

## Contributing

Please note that this project is released with
a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this
project you agree to abide by its terms.

## Configuration

This application's configuration is specified via environment variables. Here is
a table of the supported configuration parameters:

| Name                 | Format                                | Default Value |
| :------------------- | :------------------------------------ | :------------ |
| LOGGING_LEVEL        | silent, fatal, error, warn, info, debug, trace | info |
| LISTENING_PORT       | 1025-65534                            | 8080          |
| MOCK_BASE_URI        | Any valid URI                 | http://localhost:1227 |

## Development

This is a Node.JS JavaScript project and as such it relies heavily on the
Node.JS ecosystem. Package dependencies are defined via NPM and should be
installed before seeking to develop. ESLint and Prettier are used to enforce
code styling and best practices, so make sure to utilize them when contributing
code changes. Tests are defined with Jest and should be made sure to be kept in
sync with any new feature development.

Source code bootstrapping starts in [bootstrap.js](./src/bootstrap.js) and
should be the first place to look when trying to understand this code base,
besides the test modules of course.

Dependencies can be installed by running `npm install` and tests can be run
with `npm test`.

You can run this application in your development environment by
running `npm serve` from this directory. Make sure to have the configuration
environment variables properly set when running it this way.

## Building

You can build this application via Docker the normal way or by running
`npm run image` (which builds the image with a fixed tag of _api-server-mockery_.)
