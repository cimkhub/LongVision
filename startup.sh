#!/bin/bash
# Install necessary system dependencies
apt-get update
apt-get install -y libgl1

# Start the application
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:$PORT