#!/bin/bash

echo "Testing Carbon Tech API endpoints..."
echo ""

# Test GET endpoint
echo "1. Testing GET /api/carbon-tech"
curl -s http://localhost:3000/api/carbon-tech | jq '.'
echo ""

# Test health endpoint
echo "2. Testing GET /api/health"
curl -s http://localhost:3000/api/health | jq '.'
echo ""