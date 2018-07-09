#!/bin/bash

source /root/.env

echo "User: $BLOCKEX_USER"
echo "Pass: $BLOCKEX_PASS"
sleep 1s
if [ -z "$BLOCKEX_USER" ] || [ -z "$BLOCKEX_PASS" ]
then
  echo "node: BLOCKEX_USER or BLOCKEX_PASS not provied!"
  printenv
  exit 1
fi

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
rpcuser=$BLOCKEX_USER
rpcpassword=$BLOCKEX_PASS
daemon=1
txindex=1
EOL
