FROM ubuntu:bionic

COPY .env /root/.env
COPY install.sh /root/install.sh

RUN apt-get update -y && \
    apt-get install -y bash curl && \
    bash /root/install.sh

#EXPOSE 52543
#EXPOSE 52544

CMD [ "bulwarkd" ]
