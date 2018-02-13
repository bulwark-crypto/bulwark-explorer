#!/bin/bash
rm -fR ./public/*
babel -o ./public/index.js ./server/src/index.js
babel -d ./public ./server/src