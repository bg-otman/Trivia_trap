NPM ?= npm

.PHONY: install run dev build preview clean

install:
	$(NPM) install

run: dev

dev:
	$(NPM) run dev

build:
	$(NPM) run build

preview:
	$(NPM) run preview

clean:
	rm -rf node_modules dist
