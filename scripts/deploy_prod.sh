#! /bin/bash

export PATH="$HOME/.yarn/bin:$PATH"
export PATH="$HOME/.nodeuse/bin:$PATH"

cd ~/apps/card-drop/card-drop_prod
docker compose --file docker-compose.prod.yml up -d
sleep 10
cp .prod.env .env
pm2 restart card-drop_prod || pm2 start --name card-drop_prod dist/bot.js