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

docker-compose up
