# Backend Quick Start Guide

## The Problem
You're getting `ModuleNotFoundError: No module named 'fastapi'` because the Python dependencies aren't installed yet.

## Quick Fix Options

### Option 1: Full Setup (Recommended) ✅
This creates a virtual environment and installs everything properly:
```bash
cd /Users//Code/ad-maker-web/backend
python setup.py
```

Then start the server:
```bash
python start_backend.py
```

### Option 2: Quick Install (Fastest) 🚀
If you just want to get running quickly:
```bash
cd /Users//Code/ad-maker-web/backend
python quick_install.py
python main.py
```

### Option 3: Manual Install 🔧
If you prefer to do it yourself:
```bash
cd /Users//Code/ad-maker-web/backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

## What Each Script Does

- **`setup.py`** - Creates virtual environment, installs all dependencies, checks installation
- **`quick_install.py`** - Installs dependencies in current Python environment (no venv)
- **`start_backend.py`** - Starts the server (now checks for dependencies first!)

## Verifying Installation

After installing, you should be able to:
```bash
python -c "import fastapi; print('✅ FastAPI installed')"
```

## Starting the Server

Once dependencies are installed:
```bash
python start_backend.py
# OR
python main.py
```

You should see:
```
Starting Ad Maker Wizard API...
Google API Key: ✓
FAL API Key: ✓
ElevenLabs API Key: ✓
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Troubleshooting

### "pip: command not found"
```bash
python3 -m pip install --upgrade pip
```

### Permission errors
```bash
pip install --user -r requirements.txt
```

### MoviePy issues
MoviePy requires ffmpeg. Install it:
- Mac: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`
- Windows: Download from https://ffmpeg.org

## Next Steps

1. Install dependencies using one of the options above
2. Start the backend server
3. In a new terminal, run tests: `python test_api.py`
4. Or start the full app: `cd .. && python start.py`
