#!/bin/bash
# One-line install for Python 3.12 users
# Installs everything except MoviePy

echo "Installing Ad Maker Wizard (Python 3.12 compatible)..."
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 python-multipart==0.0.6 pydantic==2.5.0 python-dotenv==1.0.0 aiofiles==23.2.1 Pillow==10.1.0 numpy==1.26.0 google-generativeai==0.3.0 fal-client==0.2.0 requests==2.31.0 httpx==0.25.2

echo ""
echo "✅ Installation complete!"
echo "Note: Video processing is limited without MoviePy (Python 3.12 issue)"
echo "Install ffmpeg for basic video features: brew install ffmpeg"
echo ""
echo "Start the server with: python main.py"
