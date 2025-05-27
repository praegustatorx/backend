#!/bin/bash

# Variables
IMAGE_NAME="ts-backend"
DOCKERFILE_PATH="docker/Dockerfile"
CONTEXT_DIR="."

# Build command
echo "Building Docker image: $IMAGE_NAME..."
docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_NAME" "$CONTEXT_DIR"

# Check result
if [ $? -eq 0 ]; then
  echo "Docker image built successfully."
else
  echo "Failed to build Docker image."
  exit 1
fi
