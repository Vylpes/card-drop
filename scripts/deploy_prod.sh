#! /bin/bash

export PATH="$HOME/.yarn/bin:$PATH"
export PATH="$HOME/.nodeuse/bin:$PATH"

export BOT_TOKEN=$(cat $HOME/scripts/card-drop/prod_key.txt)

cd ~/apps/card-drop/card-drop_prod \
&& git checkout main \
&& git fetch \
&& git pull \
&& docker compose --file docker-compose.prod.yml down \
&& (pm2 stop card-drop_prod || true) \
&& (pm2 delete card-drop_prod || true) \
&& cp .prod.env .env \
&& npm run clean \
&& npm ci \
&& npm run build \
&& docker compose --file docker-compose.prod.yml up -d \
&& echo "Sleeping for 10 seconds to let database load..." \
&& sleep 10 \
&& npm run db:up \
&& NODE_ENV=production pm2 start --name card-drop_prod dist/bot.js