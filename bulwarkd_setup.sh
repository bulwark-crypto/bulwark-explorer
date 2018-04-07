#!/bin/bash
bwklink=`curl -s https://api.github.com/repos/bulwark-crypto/bulwark/releases/latest | grep browser_download_url | grep linux64 | cut -d '"' -f 4`
bwkfile=`echo $link | cut -d "/" -f 9`
cd ~
wget $bwklink
tar xzvf $bwkfile
rm $bwkfile
sudo mv ./bin/* /usr/local/bin
mkdir ~/.bulwark
cat >~/.bulwark/bulwark.conf <<EOL
rpcuser=bulwarkrpc
rpcpassword=someverysafepassword
EOL
bulwarkd -daemon
