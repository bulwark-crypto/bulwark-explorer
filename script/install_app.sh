#!/bin/bash
# Node & Yarn
echo "Installing nodejs and yarn..."
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update -y
sudo apt-get install -y build-essentail nodejs yarn

# BlockEx
echo "Installing block explorer..."
git clone https://github.com/bulwark-crypto/bulwark-explorer.git /root/blockex
cd /root/blockex
yarn install
cat > /root/blockex/config.js << EOL
const config = {
  'api': {
    'host': 'https://explorer.bulwarkcrypto.com',
    'port': '3000',
    'prefix': '/api',
    'timeout': '180s'
  },
  'coinMarketCap': {
    'api': 'http://api.coinmarketcap.com/v1/ticker/',
    'ticker': 'bulwark'
  },
  'db': {
    'host': '127.0.0.1',
    'port': '27017',
    'name': 'blockex',
    'user': '$1',
    'pass': '$2'
  },
  'freegeoip': {
    'api': 'http://freegeoip.net/json/'
  },
  'rpc': {
    'host': '127.0.0.1',
    'port': '52544',
    'user': '$1',
    'pass': '$2',
    'timeout': 12000, // 12 seconds
  }
};

module.exports = config;
EOL
echo "Running initial crons..."
nodejs cron/block.js
nodejs cron/coin.js
nodejs cron/masternode.js
nodejs cron/peer.js
nodejs cron/rich.js
echo "Starting api..."
nodejs server/index.js
