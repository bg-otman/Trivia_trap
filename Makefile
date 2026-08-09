# VENV = .venv
# PIP = $(VENV)/bin/pip
# REQUIREMENTS = backend/requirements.txt
# RED = \033[0;31m
# GREEN = \033[0;32m
# NO_COLOR = \033[0m

# help:
# 	@echo "Available commands:"
# 	@echo "  make venv     - Create virtual environment and install requirements"
# 	@echo "  make freeze   - Save current dependencies to requirements.txt"
# 	@echo "  make install  - Install dependencies from requirements.txt"

# install: $(VENV)

# run: $(VENV)
# 	uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# venv: $(VENV)

# freeze: $(VENV)
# 	@$(PIP) freeze > $(REQUIREMENTS)

# $(VENV): $(REQUIREMENTS)
# 	@python3 -m venv $(VENV)
# 	@$(PIP) install --upgrade pip
# 	$(PIP) install -r $(REQUIREMENTS)
# 	@echo " $(RED)RUN ---'$(GREEN)source $(VENV)/bin/activate'--- $(RED)to activate the virtual environment$(NO_COLOR)"

# .PHONY: install help venv freeze

VENV = .venv
RED = \033[0;31m
GREEN = \033[0;32m
NO_COLOR = \033[0m

.PHONY: help install venv run clean

help:
	@echo "Available commands:"
	@echo "  make install  - Create venv and sync all dependencies from uv.lock"
	@echo "  make run      - Run application with live reloading"
	@echo "  make clean    - Delete virtual environment"

install: $(VENV)

venv: install

run: $(VENV)
	uv run --project backend/app/ fastapi dev backend/app/main.py --port 8000

$(VENV):
	@uv sync --project backend
	@echo " $(RED)RUN ---'$(GREEN)source $(VENV)/bin/activate'--- $(RED)to activate the virtual environment$(NO_COLOR)"

clean:
	rm -rf $(VENV)
