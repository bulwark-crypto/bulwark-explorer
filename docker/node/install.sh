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
