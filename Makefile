name := venom

all: build run

build:
	@docker build . -t ${name}

run:
	@docker run -p 80:80 -v source=auth,destination=/app/auth ${name}