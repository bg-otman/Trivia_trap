VENV = .venv

help:
	@echo "Available commands:"
	@echo "  make install  - Create venv and sync all dependencies from uv.lock"
	@echo "  make run      - Run application with live reloading"
	@echo "  make clean    - Delete virtual environment"

install: $(VENV)

run: $(VENV)
	@uv run --project backend/app/ fastapi dev backend/app/main.py --port 8000

$(VENV):
	@uv sync --project backend
	@echo "To activate the virtual environment run the following command: source backend/$(VENV)/bin/activate"

clean:
	rm -rf backend/$(VENV)

.PHONY: install run
