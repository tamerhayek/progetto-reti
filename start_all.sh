#!/bin/bash

sudo docker-compose --env-file .env down --rmi "all" -v
sudo docker-compose --env-file .env build
sudo docker-compose --env-file .env up -d
npm i && npm test