.PHONY: dev build start db-push db-generate db-seed db-reset docker-up docker-down clean

# Development
dev:
	npm run dev

build:
	npm run build

start:
	npm run start

# Database
db-generate:
	npm run db:generate

db-push:
	npm run db:push

db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

db-reset:
	npm run db:reset

# Docker
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# Full setup
setup: docker-up db-generate db-push db-seed
	@echo "Setup complete! Run 'make dev' to start the server."

# Clean
clean:
	rm -rf dist node_modules
