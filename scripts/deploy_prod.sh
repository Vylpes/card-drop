#! /bin/bash

export PATH="$HOME/.yarn/bin:$PATH"
export PATH="$HOME/.nodeuse/bin:$PATH"

cd ~/apps/card-drop/card-drop_prod \
&& git checkout main \
&& git fetch \
&& git pull \
&& docker compose down \
&& (pm2 stop card-drop_prod || true) \
&& (pm2 delete card-drop_prod || true) \
&& cp .prod.env .env \
&& yarn clean \
&& yarn install --frozen-lockfile \
&& yarn build \
&& docker compose up -d \
&& echo "Sleeping for 10 seconds to let database load..." \
&& sleep 10 \
&& yarn run db:up \
&& NODE_ENV=production pm2 start --name card-drop_prod dist/bot.js