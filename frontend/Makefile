PNPM ?= pnpm

.PHONY: install run dev build preview clean

install:
	$(PNPM) install

run: dev

dev:
	$(PNPM) run dev

build:
	$(PNPM) run build

preview:
	$(PNPM) run preview

clean:
	rm -rf node_modules dist
