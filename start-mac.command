#!/bin/bash
cd "$(dirname "$0")"
( sleep 1.5; open "http://localhost:8137/index.html" ) &
python3 -m http.server 8137 --bind 127.0.0.1
