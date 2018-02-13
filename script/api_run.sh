#!/bin/bash
rm -fR ./server/dist/*
babel -o ./server/dist/index.js ./server/src/index.js
babel -d ./server/dist ./server/src
node ./server/dist