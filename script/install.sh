#!/bin/bash
# Setup
echo "Updating system..."
sudo apt-get update -y
sudo apt-get install -y curl git vim wget

# Variables
echo "Setting up variables..."
ip=$(dig +short myip.opendns.com @resolver1.opendns.com)
rpcuser=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 13 ; echo '')
rpcpassword=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo '')

# Install
echo "Starting installation..."
./script/install_nginx.sh $ip
./script/install_mongo.sh
./script/install_bwk.sh $rpcuser $rpcpassword
./script/install_app.sh $rpcuser $rpcpassword
