#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================================="
echo "          Building Medisense Full-Stack on Render         "
echo "=========================================================="

echo "Step 1: Installing and building React Vite Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Step 2: Installing Python Backend Requirements..."
cd backend
pip install -r requirements.txt
cd ..

echo "=========================================================="
echo " Build successful! Medisense is ready to start on Render. "
echo "=========================================================="

