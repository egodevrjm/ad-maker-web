#!/bin/bash

echo "Starting Ad Maker Web..."
echo ""

# Check for FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed. Video processing features will not work."
    echo "   Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)"
    echo ""
fi

# Start backend
echo "Starting backend server..."
cd backend-node
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo ""
echo "Starting frontend..."
cd ../frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
