#!/bin/bash

source /root/.env

echo "User: $BLOCKEX_USER"
echo "Pass: $BLOCKEX_PASS"
sleep 1s
if [ -z "$BLOCKEX_USER" ] || [ -z "$BLOCKEX_PASS" ]
then
  echo "app: BLOCKEX_USER or BLOCKEX_PASS not provied!"
  printenv
  exit 1
fi

#apt-get install -y apt-transport-https build-essential cron curl gcc git g++ make sudo vim wget
#apt-get install -y --no-install-recommends apt-utils

#curl -sL https://deb.nodesource.com/setup_8.x | bash -
#apt-get install -y nodejs

#curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
#echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
#apt-get update -y
#apt-get install -y yarn

#git clone https://github.com/bulwark-crypto/bulwark-explorer.git /root/blockex
cd /root/blockex
cat > config.js << EOL
const config = {
  "api": {
    "host": "http://localhost",
    "port": "3000",
    "prefix": "/api",
    "timeout": "180s"
  },
  "coinMarketCap": {
    "api": "http://api.coinmarketcap.com/v1/ticker/",
    "ticker": "bulwark"
  },
  "db": {
    "host": "127.0.0.1",
    "port": "27017",
    "name": "blockex",
    "user": "$BLOCKEX_USER",
    "pass": "$BLOCKEX_PASS"
  },
  "freegeoip": {
    "api": "http://freegeoip.net/json/"
  },
  "rpc": {
    "host": "127.0.0.1",
    "port": "52544",
    "user": "$BLOCKEX_USER",
    "pass": "$BLOCKEX_PASS",
    "timeout": 12000, // 12 seconds
  }
};

module.exports = config;
EOL
cat config.js
sleep 2s

#node ./server/mongo.js

yarn install
