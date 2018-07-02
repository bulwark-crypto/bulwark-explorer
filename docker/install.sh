#!/bin/bash
# Setup
echo "Updating system..."
apt-get update -y
apt-get install -y build-essential curl git vim wget

# Node & Yarn
echo "Installing nodejs and yarn..."
curl -sL https://deb.nodesource.com/setup_8.x | -E bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update -y
apt-get install -y nodejs yarn

# Variables
echo "Setting up variables..."
ip=$(dig +short myip.opendns.com @resolver1.opendns.com)
rpcuser=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 13 ; echo '')
rpcpassword=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')
echo "IP: "$ip
echo "User: "$rpcuser
echo "Pass: "$rpcpassword

# Install
echo "Installing nginx..."
apt-get install -y nginx
rm -f /etc/nginx/sites-available/default
cat > /etc/nginx/sites-available/default << EOL
server {
	root /var/www/html;
	index index.html index.htm index.nginx-debian.html;
	server_name explorer.bulwarkcrypto.com $ip;

	gzip on;
	gzip_static on;
	gzip_disable "msie6";

	gzip_vary on;
	gzip_proxied any;
	gzip_comp_level 6;
	gzip_buffers 16 8k;
	gzip_http_version 1.1;
	gzip_min_length 256;
	gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype image/svg+xml image/x-icon;

	location / {
		proxy_pass http://127.0.0.1:3000;
	        proxy_http_version 1.1;
	        proxy_set_header Upgrade \$http_upgrade;
	        proxy_set_header Connection 'upgrade';
	        proxy_set_header Host \$host;
	        proxy_cache_bypass \$http_upgrade;
	}

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/explorer.bulwarkcrypto.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/explorer.bulwarkcrypto.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = explorer.bulwarkcrypto.com) {
        return 301 https://\$host\$request_uri;
    } # managed by Certbot

	listen 80 default_server;
	listen [::]:80 default_server;

	server_name explorer.bulwarkcrypto.com;
    return 404; # managed by Certbot
}
EOL
systemctl start nginx
systemctl enable nginx

echo "Installing mongodb..."
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.6.list
apt-get update -y
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod
mongo blockex --eval "db.createUser( { user: $rpcuser, pwd: $rpcpassword, roles: [ \"readWrite\" ] } )"

echo "Installing Bulwark..."
bwklink=`curl -s https://api.github.com/repos/bulwark-crypto/bulwark/releases/latest | grep browser_download_url | grep linux64 | cut -d '"' -f 4`
mkdir -p /tmp/bulwark
cd /tmp/bulwark
curl -Lo bulwark.tar.gz $bwklink
tar -xzf bulwark.tar.gz
mv ./bin/* /usr/local/bin
cd
rm -rf /tmp/bulwark
mkdir -p /root/.bulwark
cat > /root/.bulwark/bulwark.conf << EOL
rpcport=52544
rpcuser=$rpcuser
rpcpassword=$rpcpassword
daemon=1
txindex=1
EOL
bulwarkd

echo "Installing BlockEx..."
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
    'user': '$rpcuser',
    'pass': '$rpcpassword'
  },
  'freegeoip': {
    'api': 'http://freegeoip.net/json/'
  },
  'rpc': {
    'host': '127.0.0.1',
    'port': '52544',
    'user': '$rpcuser',
    'pass': '$rpcpassword',
    'timeout': 12000, // 12 seconds
  }
};

module.exports = config;
EOL
nodejs cron/block.js
nodejs cron/coin.js
nodejs cron/masternode.js
nodejs cron/peer.js
nodejs cron/rich.js
nodejs server/index.js

