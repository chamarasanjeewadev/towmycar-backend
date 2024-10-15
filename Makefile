# Makefile

# Variables
DOCKER_COMPOSE_FILE := db/docker-compose.yml
VOLUME_DIR := ./db-data/breakdown_db_server/*

# Targets
.PHONY: all down clear-data up restart

all: restart

# Stop the Docker containers
down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

# Remove the volume directory
clear-data:
	rm -rf $(VOLUME_DIR)

# Start the Docker containers
up:
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d

# Restart the Docker containers with clean data
restart: down clear-data up

q-up: cd packages/towmycar_api && yarn dev2

# Ensure the Makefile is not executed as a shell script
SHELL := /bin/bash

# Add these new targets at the end of your Makefile

# Build, tag, and push all services
deploy-all: deploy-tow-api deploy-finder-service deploy-notification-service

# Individual service deployment targets
deploy-tow-api:
	docker build -t tow-api -f apps/towmycar_api/Dockerfile .
	docker tag tow-api:latest 418272783904.dkr.ecr.eu-north-1.amazonaws.com/tow-api:latest
	docker push 418272783904.dkr.ecr.eu-north-1.amazonaws.com/tow-api:latest

deploy-finder-service:
	docker build -t finder-service -f apps/finder_service/Dockerfile .
	docker tag finder-service:latest 418272783904.dkr.ecr.eu-north-1.amazonaws.com/finder-service:latest
	docker push 418272783904.dkr.ecr.eu-north-1.amazonaws.com/finder-service:latest

deploy-notification-service:
	docker build -t notification-service -f apps/notification_service/Dockerfile .
	docker tag notification-service:latest 418272783904.dkr.ecr.eu-north-1.amazonaws.com/towmycar/notification-service:latest
	docker push 418272783904.dkr.ecr.eu-north-1.amazonaws.com/towmycar/notification-service:latest
