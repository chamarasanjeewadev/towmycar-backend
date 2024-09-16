# Define the services
SERVICES := breakdown_service notification_service quotation_service

# Base directory for services
BASE_DIR := .

# Default target
all: up

# Start all services
up:
	@echo "Starting all services..."
	@for service in $(SERVICES); do \
		if [ -d "$(BASE_DIR)/$$service" ]; then \
			echo "Starting $$service..."; \
			cd $(BASE_DIR)/$$service && yarn install && yarn dev & \
			cd - >/dev/null; \
		else \
			echo "Warning: $$service directory not found. Skipping."; \
		fi; \
	done
	@echo "All services are starting. Waiting for them to be ready..."
	@sleep 10  # Give services some time to start
	@make check_services

# Stop all services
down:
	@echo "Stopping all services..."
	@-pkill -f "yarn dev"
	@echo "All services stopped."

# Check if all services are running
check_services:
	@echo "Checking if all services are running..."
	@for service in $(SERVICES); do \
		if [ -d "$(BASE_DIR)/$$service" ]; then \
			if pgrep -f "$$service.*yarn dev" > /dev/null; then \
				echo "$$service is running."; \
			else \
				echo "$$service is not running. Attempting to start..."; \
				cd $(BASE_DIR)/$$service && yarn dev & \
				cd - >/dev/null; \
			fi; \
		else \
			echo "Warning: $$service directory not found. Cannot check or start."; \
		fi; \
	done
	@echo "All available services should be running now. Use 'make logs' to view logs."

.PHONY: all up down check_services
