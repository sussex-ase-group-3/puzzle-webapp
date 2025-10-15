#!/usr/bin/env bash
(set -e; cd api && npm install && npm run dev) &
API_PID=$!
(set -e; cd web && npm install && npm run dev) &
WEB_PID=$!
trap "kill $API_PID $WEB_PID 2>/dev/null" EXIT
wait
