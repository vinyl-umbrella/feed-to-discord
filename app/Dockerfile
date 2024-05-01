# build stage
FROM node:20.11.1-alpine3.18 as builder

WORKDIR /src
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# execution stage
FROM node:20.11.1-alpine3.18

COPY --from=builder /src/dist /src/dist
COPY --from=builder /src/package*.json /src/
COPY --from=builder /src/node_modules /src/node_modules

WORKDIR /src

CMD ["node", "dist/index.js"]
