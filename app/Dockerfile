FROM node:20.11.1-alpine3.18

WORKDIR /src
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

