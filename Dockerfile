# Build Stage
FROM node:14-alpine AS build
WORKDIR /app
SHELL ["/bin/ash", "-xo", "pipefail", "-c"]

### Install production dependencies
COPY package.json package-lock.json ./
ARG NODE_ENV=production
RUN npm ci --ignore-scripts --only=production

# Final Stage
FROM node:14-alpine AS final
WORKDIR /app
SHELL ["/bin/ash", "-xo", "pipefail", "-c"]

## Install application & dependencies
COPY --from=build /app/node_modules ./node_modules/
COPY package-lock.json ./
COPY src/ ./

## Define runtime details
USER node
EXPOSE 8080
HEALTHCHECK --interval=5s --start-period=1s CMD [\
  "wget", "--spider", "http://localhost:9000/health"\
]
CMD ["node", "bootstrap"]
