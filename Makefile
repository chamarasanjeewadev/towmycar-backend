# Makefile

# Variables
DOCKER_COMPOSE_FILE = db/docker-compose.yml
VOLUME_DIR = ./db-data/breakdown_db_server/

# Targets
.PHONY: all down clear-data up restart

all: restart

# Stop the Docker containers
down:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

# Remove the volume directory
clear-data:
	rm -rf $(VOLUME_DIR)

# Start the Docker containers
up:
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d

# Restart the Docker containers with clean data
restart: down clear-data up