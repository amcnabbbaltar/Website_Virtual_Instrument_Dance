@echo off
cd /d "%~dp0"
start "" http://localhost:8137/index.html
py -m http.server 8137 --bind 127.0.0.1 || python -m http.server 8137 --bind 127.0.0.1
pause
