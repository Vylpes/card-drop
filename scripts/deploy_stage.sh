#! /bin/bash

export PATH="$HOME/.yarn/bin:$PATH"
export PATH="$HOME/.nodeuse/bin:$PATH"

cd ~/apps/card-drop/card-drop_stage
docker compose --file docker-compose.stage.yml up -d
sleep 10
cp .stage.env .env
pm2 restart card-drop_stage || pm2 start --name card-drop_stage dist/bot.js