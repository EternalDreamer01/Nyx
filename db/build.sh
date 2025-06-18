#!/usr/bin/env sh

# docker build -t sqlite3:local https://github.com/KEINOS/Dockerfile_of_SQLite3.git
docker pull keinos/sqlite3:latest
docker cp 
docker run -dt --rm -v "$(pwd)/db:/workspace" -w /workspace keinos/sqlite3
