FROM node:18.15-bullseye-slim

WORKDIR /src
COPY package*.json .
RUN npm install

# RUN apt-get update && \
#     apt-get install -y cron && \
#     pip install -r /src/requirements.txt && \
#     echo '*/10 * * * * /usr/local/bin/node /src/scraper.js' >> /etc/crontab

CMD [ "npm", "run", "start" ]
