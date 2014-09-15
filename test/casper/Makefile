TESTS=$(wildcard test-*.js)
CC=casperjs test --includes=tools.js,params.js

all:
	$(CC) $(TESTS)

basic:
	$(CC) test-basic.js
fsm:
	$(CC) test-fsm.js
keys:
	$(CC) test-keys.js
