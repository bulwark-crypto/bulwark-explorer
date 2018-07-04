FROM keymetrics/pm2:latest-stretch

COPY package.json .
COPY pm2.json .
COPY install.sh .

RUN apt-get update -y && apt-get install -y bash

RUN bash install.sh

CMD [ "pm2-runtime", "start", "pm2.json" ]
