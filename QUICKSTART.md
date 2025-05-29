# Quick Start Guide

## Prerequisites

1. **Node.js** (v16 or higher)
   - Check: `node --version`
   - Install: https://nodejs.org/

2. **FFmpeg** (for video processing)
   - Check: `ffmpeg -version`
   - Install:
     - macOS: `brew install ffmpeg`
     - Ubuntu/Debian: `sudo apt-get install ffmpeg`
     - Windows: Download from https://ffmpeg.org/download.html

3. **API Keys** (all free tiers available)
   - Google Gemini: https://makersuite.google.com/app/apikey
   - FAL.ai: https://fal.ai/dashboard
   - ElevenLabs: https://elevenlabs.io/api

## Installation

```bash
# 1. Clone the repository
git clone [repository-url]
cd ai-commercial-generator

# 2. Install backend dependencies
cd backend-node
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Install frontend dependencies
cd ../frontend
npm install
```

## Running the App

```bash
# Option 1: Use the start script
./start.sh

# Option 2: Manual start
# Terminal 1 - Backend:
cd backend-node
npm start

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

## First Commercial

1. Enter a product idea (e.g., "smart water bottle")
2. Select audience and mood
3. Click through the wizard - each step builds on the previous
4. Wait for AI generation (videos take 30-60s each)
5. Download your finished commercial!

## Troubleshooting

- **"API key not configured"**: Check your .env file
- **"Failed to generate video"**: Verify FAL.ai key and credits
- **"FFmpeg not found"**: Install FFmpeg (see prerequisites)
- **Port already in use**: Kill processes on ports 3000/8000

## Using Placeholder Mode

If you want to test without using API credits:
- Check "Use placeholder videos" in the Video Generation step
- The app will use mock data instead of calling APIs
