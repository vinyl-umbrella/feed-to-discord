FROM node:18.15-bullseye-slim

WORKDIR /src
COPY package*.json .
RUN npm install

CMD [ "npm", "run", "start" ]
