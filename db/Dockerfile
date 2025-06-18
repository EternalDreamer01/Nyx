FROM keinos/sqlite3:latest

WORKDIR /db
COPY . .

VOLUME sqlite3 /db

RUN sqlite3 ./user.db < init.sql
# test:
# RUN sqlite3 ./user.db ".mode csv" ".import test.csv user"
# CMD ["sqlite3", "./user.db", "-header", "-column", "SELECT * FROM user;"]

RUN sh ./populate.sh
