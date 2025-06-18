#!/usr/bin/env sh


sqlite3 ./user.db \
	".mode csv" \
	".separator ; .import --skip 1 test.csv user"
