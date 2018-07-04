#!/bin/bash

apt-get install -y apt-transport-https build-essential cron curl gcc git g++ make sudo vim wget

curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt-get install -y nodejs

curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update -y
apt-get install -y yarn

echo $PWD
git clone https://github.com/bulwark-crypto/bulwark-explorer.git blockex
cd blockex
yarn install

cat > config.js << EOL
const config = {
  "api": {
    "host": "https://explorer.bulwarkcrypto.com",
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

echo "User: $BLOCKEX_USER $BLOCKEX_PASS"
