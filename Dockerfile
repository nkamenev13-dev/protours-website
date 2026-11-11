FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY build.mjs content.mjs privacy.mjs offer.mjs tour-sheet.mjs tour-catalogue.csv ./
COPY assets ./assets
RUN node build.mjs

FROM node:24-bookworm-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.mjs ./
USER node
CMD ["node", "server.mjs"]
