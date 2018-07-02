#!/bin/bash
echo "Setting up Bulwark node..."
bwklink=`curl -s https://api.github.com/repos/bulwark-crypto/bulwark/releases/latest | grep browser_download_url | grep linux64 | cut -d '"' -f 4`
sudo mkdir -p /tmp/bulwark
cd /tmp/bulwark
curl -Lo bulwark.tar.gz $bwklink
tar -xzf bulwark.tar.gz
sudo mv ./bin/* /usr/local/bin
cd
sudo rm -rf /tmp/bulwark
sudo mkdir -p /root/.bulwark
sudo cat > /root/.bulwark/bulwark.conf << EOL
rpcport=52544
rpcuser=$1
rpcpassword=$2
daemon=1
txindex=1
EOL
bulwarkd
