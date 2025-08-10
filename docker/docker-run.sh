#!/bin/bash

# Docker run script to avoid nesting in Docker Desktop
# This script builds and runs the container directly without docker-compose

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building Docker image...${NC}"

# Load environment variables
if [ -f "../.env.local" ]; then
    set -a
    source ../.env.local
    set +a
    echo "Loaded .env.local"
elif [ -f "../.env" ]; then
    set -a
    source ../.env
    set +a
    echo "Loaded .env"
else
    echo -e "${RED}Warning: No .env or .env.local file found${NC}"
fi

# Build the image with build args
docker build \
    --build-arg GEMINI_API_KEY="$GEMINI_API_KEY" \
    --build-arg OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
    --build-arg OPENAI_API_KEY="$OPENAI_API_KEY" \
    -t ai-website-generator:latest \
    -f Dockerfile \
    ..

echo -e "${GREEN}Stopping any existing container...${NC}"
docker stop ai-website-generator 2>/dev/null || true
docker rm ai-website-generator 2>/dev/null || true

echo -e "${GREEN}Starting new container...${NC}"
# Run container directly (not via docker-compose) to avoid nesting
docker run -d \
    --name ai-website-generator \
    -p 8080:8080 \
    --env-file ../.env.local \
    --restart unless-stopped \
    ai-website-generator:latest

echo -e "${GREEN}Container started successfully!${NC}"
echo "Access the application at: http://localhost:8080"
echo ""
echo "Useful commands:"
echo "  docker logs ai-website-generator     # View logs"
echo "  docker stop ai-website-generator     # Stop container"
echo "  docker restart ai-website-generator  # Restart container"