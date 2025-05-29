# Python 3.12 Compatibility Guide

## The Problem

You're getting this error because Python 3.12 removed `pkgutil.ImpImporter`, which some older packages (particularly MoviePy) still rely on:

```
AttributeError: module 'pkgutil' has no attribute 'ImpImporter'
```

## Quick Solutions

### Solution 1: Quick Fix (Fastest) 🚀
This installs only essential packages, skipping MoviePy:

```bash
cd /Users//Code/ad-maker-web/backend
python quickfix_py312.py
python main.py
```

### Solution 2: Full Python 3.12 Install
This installs all compatible packages with alternatives:

```bash
cd /Users//Code/ad-maker-web/backend
python install_py312.py
python main.py
```

### Solution 3: Manual Install
Skip the problematic MoviePy package:

```bash
pip install fastapi uvicorn[standard] python-multipart pydantic python-dotenv
pip install google-generativeai fal-client requests httpx
pip install Pillow numpy aiofiles
python main.py
```

### Solution 4: Use Python 3.11 (Recommended for full features)
If you need full video processing capabilities:

```bash
# Install Python 3.11 using pyenv or conda
conda create -n admaker python=3.11
conda activate admaker

# Then install normally
pip install -r requirements.txt
python main.py
```

## What Features Are Affected?

Without MoviePy, these features have limited functionality:
- Video stitching (basic functionality using ffmpeg directly)
- Final video creation (requires ffmpeg installed)
- Some video effects

Everything else works perfectly:
- ✅ Script generation (Gemini)
- ✅ Video generation (FAL.ai)
- ✅ Sound effects (ElevenLabs)
- ✅ Voiceover (ElevenLabs)
- ✅ Social posts
- ✅ Basic video combining (with ffmpeg)

## Installing ffmpeg (Required for Video Processing)

Even without MoviePy, you can still process videos if ffmpeg is installed:

**Mac:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## Checking Your Setup

Run this to see what's missing:
```bash
python check_dependencies.py
```

## Alternative: Docker

For a guaranteed working environment:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

## The Backend Still Works!

Even with the MoviePy issue, the backend will start and work for most features. The code has been updated to gracefully handle the missing MoviePy dependency.

## Long-term Solution

MoviePy developers are working on Python 3.12 compatibility. Once updated, you can install the full requirements.txt normally.

For now, use one of the quick fixes above to get running immediately!
