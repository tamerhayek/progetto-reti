docker-compose --env-file .env down --rmi "all" -v
docker-compose --env-file .env build
docker-compose --env-file .env up -d
npm i && npm test