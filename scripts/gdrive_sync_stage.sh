#!/bin/bash

cd ~/apps/card-drop/card-drop_stage \
&& rclone sync card-drop-gdrive: ./cards \
&& curl -X POST http://localhost:3313/api/reload-db