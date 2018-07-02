#!/bin/bash
docker-compose down
docker rmi -f docker_blockex:latest
sudo rm -fR bulwark/ data/ nginx/
