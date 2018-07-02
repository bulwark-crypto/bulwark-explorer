#!/bin/bash
echo "Installing nginx..."
sudo apt-get install -y nginx
sudo rm -f /etc/nginx/sites-available/default
sudo cat > /etc/nginx/sites-available/default << EOL
server {
	root /var/www/html;
	index index.html index.htm index.nginx-debian.html;
	server_name explorer.bulwarkcrypto.com $1;

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
sudo systemctl start nginx
sudo systemctl enable nginx
