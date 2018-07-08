#!/bin/bash

user=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 13 ; echo '')
pass=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')

cat > ./app/.env << EOL
BLOCKEX_USER=$user
BLOCKEX_PASS=$pass
EOL

cat > ./node/.env << EOL
BLOCKEX_USER=$user
BLOCKEX_PASS=$pass
EOL

rm -fR ./app/blockex
mkdir -p ./app/blockex
cp -R ../* ./app/blockex

docker-compose up
