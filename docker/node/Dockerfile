FROM ubuntu:bionic

COPY install.sh .

RUN apt-get update -y && apt-get install -y bash

RUN bash install.sh

CMD [ "echo", "Bulwark" ]
