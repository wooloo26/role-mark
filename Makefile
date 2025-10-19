.PHONY: help db-up db-down db-restart db-reset setup

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "Docker & Database:"
	@echo "  make db-up          - Start PostgreSQL container"
	@echo "  make db-down        - Stop and remove PostgreSQL container"
	@echo "  make db-restart     - Restart PostgreSQL container"
	@echo "  make docker-clean   - Remove all Docker containers and volumes"
	@echo ""
	@echo "Database Management:"
	@echo "  make db-generate    - Generate Prisma client"
	@echo "  make db-push        - Push schema changes to database"
	@echo "  make db-migrate     - Run Prisma migrations"
	@echo "  make db-studio      - Open Prisma Studio"
	@echo "  make db-seed        - Seed the database"
	@echo "  make db-reset       - Reset database and run migrations"
	@echo ""
	@echo "Setup:"
	@echo "  make setup          - Complete project setup (install, db-up, db-migrate, db-seed)"

# Docker & Database Commands
db-up:
	@echo "Starting PostgreSQL container..."
	docker-compose up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@timeout /t 5 /nobreak >nul
	@echo "PostgreSQL is ready!"

db-down:
	@echo "Stopping PostgreSQL container..."
	docker-compose down

db-restart:
	@echo "Restarting PostgreSQL container..."
	docker-compose restart
	@echo "Waiting for PostgreSQL to be ready..."
	@timeout /t 5 /nobreak >nul

db-reset:
	@echo "Resetting database..."
	@echo "This will delete all data and re-run migrations!"
	@echo "Press Ctrl+C to cancel, or"
	@pause
	docker-compose down -v
	docker-compose up -d
	@timeout /t 5 /nobreak >nul
	pnpm db:migrate
	pnpm db:seed
	@echo "Database reset complete!"

# Complete Setup
setup:
	@echo "=== Setting up RoleMark project ==="
	@echo ""
	@echo "Step 1: Installing dependencies..."
	pnpm install
	@echo "Step 2: Generating Prisma client..."
	pnpm db:generate
	@echo "Step 3: Starting PostgreSQL..."
	docker-compose up -d
	@timeout /t 5 /nobreak >nul
	@echo ""
	@echo "Step 4: Running migrations..."
	pnpm db:migrate
	@echo ""
	@echo "Step 5: Seeding database..."
	pnpm db:seed
	@echo ""
	@echo "=== Setup complete! ==="
	@echo ""
	@echo "You can now run 'make dev' to start the development server"
