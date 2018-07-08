FROM keymetrics/pm2:latest-stretch

COPY .env /root/.env
COPY install.sh /root/install.sh
COPY blockex /root/blockex

RUN apt-get update -y && \
    apt-get install -y bash && \
    bash /root/install.sh
RUN sleep 15s

#EXPOSE 80
#EXPOSE 443
#EXPOSE 3000

CMD [ "pm2-runtime", "start", "/root/blockex/pm2.json" ]
