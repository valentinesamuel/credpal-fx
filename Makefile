# Environment selection (default: development)
ENV ?= development
ENV_FILE := .env
SERVICE ?= all

# Immediately check for env file
ifeq (,$(wildcard $(ENV_FILE)))
$(error ❌ Missing environment file: $(ENV_FILE))
endif

.PHONY: help up down restart ps logs healthcheck clean

help:
	@echo "Service Control:"
	@echo "  make up SERVICE=postgres   - Start specified service"
	@echo "  make down SERVICE=redis    - Stop specified service"
	@echo "  make healthcheck           - Check service health status"

### Core Commands ###
dev:
	@echo "ℹ️  Starting application in dev mode..."
	@npm run start:dev

debug:
	@echo "ℹ️ Start application in debug mode"	
	@npm run start:debug

	
up:
	@docker compose --env-file $(ENV_FILE) up -d $(if $(filter-out all,$(SERVICE)),$(SERVICE)) >/dev/null 2>&1
	@echo "✓ Successfully started $(if $(filter-out all,$(SERVICE)),$(SERVICE),all services)"

down:
	@if [ -z "$$(docker compose ps $(if $(filter-out all,$(SERVICE)),$(SERVICE)) --quiet 2>/dev/null)" ]; then \
		echo "ℹ️  No $(if $(filter-out all,$(SERVICE)),$(SERVICE),services) currently running"; \
	else \
		docker compose down >/dev/null 2>&1 && \
		echo "✓ Successfully stopped $(if $(filter-out all,$(SERVICE)),$(SERVICE),all services)"; \
	fi

restart:
	@if [ -z "$$(docker compose ps $(if $(filter-out all,$(SERVICE)),$(SERVICE)) --quiet 2>/dev/null)" ]; then \
		echo "ℹ️  Cannot restart - no $(if $(filter-out all,$(SERVICE)),$(SERVICE),services) currently running"; \
	else \
		docker compose restart $(if $(filter-out all,$(SERVICE)),$(SERVICE)) >/dev/null 2>&1 && \
		echo "✓ Successfully restarted $(if $(filter-out all,$(SERVICE)),$(SERVICE),all services)"; \
	fi

### Monitoring ###
ps:
	@if [ -z "$$(docker compose ps --quiet 2>/dev/null)" ]; then \
		echo "ℹ️  No services currently running"; \
	else \
		docker compose ps; \
	fi

logs:
	@if [ -z "$$(docker compose ps $(if $(filter-out all,$(SERVICE)),$(SERVICE)) --quiet 2>/dev/null)" ]; then \
		echo "ℹ️  Cannot show logs - $(if $(filter-out all,$(SERVICE)),$(SERVICE) is,services are) not running"; \
	else \
		docker compose logs -f $(if $(filter-out all,$(SERVICE)),$(SERVICE)) 2>/dev/null || echo "ℹ️  No logs available for $(if $(filter-out all,$(SERVICE)),$(SERVICE),these services)"; \
	fi

### Health Checks ###
healthcheck:
	@if [ "$(SERVICE)" = "all" ] || [ "$(SERVICE)" = "postgres" ]; then \
		if docker ps --filter "name=credpalfx_postgres" --format '{{.Status}}' | grep -q "Up"; then \
			echo "Checking PostgreSQL... "; \
			user=$$(grep '^DATABASE_USER=' $(ENV_FILE) 2>/dev/null | cut -d= -f2); \
			if [ -n "$$user" ] && docker exec -i credpalfx_postgres pg_isready -U $$user >/dev/null 2>&1; then \
				echo "✓ Healthy"; \
			else \
				echo "⚠️  Running but can't connect (check credentials)"; \
				docker logs credpalfx_postgres | tail -5; \
			fi; \
		else \
			echo "✗ Not running"; \
		fi; \
	fi
	@if [ "$(SERVICE)" = "all" ] || [ "$(SERVICE)" = "redis" ]; then \
		if docker ps --filter "name=credpalfx_redis" --format '{{.Status}}' | grep -q "Up"; then \
			echo  "Checking Redis... "; \
			if docker exec -i credpalfx_redis redis-cli ping | grep -q PONG; then \
				echo "✓ Healthy"; \
			else \
				echo "⚠️  Running but unresponsive"; \
				docker logs credpalfx_redis | tail -5; \
			fi; \
		else \
			echo "✗ Not running"; \
		fi; \
	fi


clean:
	@if [ -z "$$(docker compose ps --quiet 2>/dev/null)" ]; then \
		echo "ℹ️  No services to clean - none are running"; \
	else \
		docker compose down >/dev/null 2>&1; \
		echo "✓ Stopped all running services"; \
	fi
	@docker volume rm -f credpal-fx_tempo_data credpal-fx_prometheus_data credpal-fx_grafana_data credpal-fx_loki_data credpal-fx_credpalfx_postgres_data credpal-fx_credpalfx_redis_data >/dev/null 2>&1 || true
	@echo "✓ Successfully cleaned up all resources" 