VENV = .venv

help:
	@echo "Available commands:"
	@echo "  make install  - Create venv and sync all dependencies from uv.lock"
	@echo "  make run      - Run application with live reloading"
	@echo "  make clean    - Delete virtual environment"

install: $(VENV)

run: $(VENV)
	@docker start trivia_postgres
	@until docker exec trivia_postgres pg_isready -U admin -d trivia_db >/dev/null 2>&1; do sleep 1; done
	@uv run alembic upgrade head
	@uv run --env-file .env fastapi dev app/main.py --port 8000


$(VENV):
	@uv sync
	@echo "To activate the virtual environment run the following command: source $(VENV)/bin/activate"

clean:
	rm -rf $(VENV)

fclean: clean
	@find . -type d -name "__pycache__" -exec rm -rf {} +
	@find . -type f -name "*.py[co]" -delete

.PHONY: install run test
