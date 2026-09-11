.PHONY: help dev dev-backend dev-frontend build test lint clean docker-up docker-down

# Default target
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Development ──────────────────────────────────────────────

dev: ## Start both frontend + backend (backend on :8000, frontend on :5173)
	@echo "Starting Tone Breath development environment..."
	@echo "  Backend:  http://localhost:8000"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Swagger:  http://localhost:8000/docs"
	@echo ""
	@make -j2 dev-backend dev-frontend

dev-backend: ## Start backend only (FastAPI on :8000)
	cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start frontend only (Vite on :5173)
	cd app && npm run dev

dev-full: ## Start backend serving PWA (no hot reload, port 8000)
	cd app && npm run build
	cd backend && source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000

# ─── Build ────────────────────────────────────────────────────

build: build-frontend ## Build everything

build-frontend: ## Build frontend PWA
	cd app && npm run build

# ─── Test ─────────────────────────────────────────────────────

test: test-backend test-frontend ## Run all tests

test-backend: ## Run backend tests
	cd backend && source .venv/bin/activate && pytest tests/ -v

test-frontend: ## Run frontend lint
	cd app && npm run lint

# ─── Lint ─────────────────────────────────────────────────────

lint: ## Run all linters
	cd app && npm run lint

# ─── Setup ────────────────────────────────────────────────────

setup: setup-backend setup-frontend ## Setup everything

setup-backend: ## Setup backend (venv + deps)
	cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && pip install pytest

setup-frontend: ## Setup frontend (npm install)
	cd app && npm run install

# ─── Clean ────────────────────────────────────────────────────

clean: ## Clean build artifacts
	rm -rf app/dist
	rm -rf backend/.venv
	rm -rf backend/__pycache__
	rm -rf backend/app/__pycache__
	rm -rf backend/app/routers/__pycache__
	rm -rf backend/tests/__pycache__
	rm -rf backend/.pytest_cache

# ─── Docker ───────────────────────────────────────────────────

docker-up: ## Start Docker containers
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-build: ## Build Docker containers
	docker compose build

docker-logs: ## View Docker logs
	docker compose logs -f
