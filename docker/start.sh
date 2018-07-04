#!/bin/bash
u=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 13 ; echo '')
p=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')

cat > .env << EOL
BLOCKEX_USER=$u
BLOCKEX_PASS=$p
EOL

cp -f ../package.json app/package.json
cp -f ../pm2.json app/pm2.json

docker-compose up
