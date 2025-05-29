#!/bin/bash
# Quick installer for Ad Maker Wizard Backend

echo "Installing Ad Maker Wizard Backend dependencies..."
echo "=============================================="

# Install Python packages
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 python-multipart==0.0.6 pydantic==2.5.0 python-dotenv==1.0.0 aiofiles==23.2.1 Pillow==10.1.0 moviepy==1.0.3 numpy==1.24.3 google-generativeai==0.3.0 fal-client==0.2.0 requests==2.31.0 httpx==0.25.2

echo ""
echo "✅ Installation complete!"
echo "Now you can run: python main.py"
