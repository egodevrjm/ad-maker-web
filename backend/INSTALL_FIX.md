# 🚨 Python 3.12 Installation Fix

You're getting an error because **MoviePy doesn't support Python 3.12 yet**. Here are your options:

## Fastest Fix (30 seconds) ⚡

```bash
cd /Users//Code/ad-maker-web/backend
pip install -r requirements_minimal.txt
python main.py
```

This skips MoviePy but everything else works!

## Other Options

### Smart Installer (Auto-detects Python version)
```bash
python smart_install.py
```

### Quick Fix Script
```bash
python quickfix_py312.py
```

### Bash One-liner
```bash
chmod +x install_quick.sh && ./install_quick.sh
```

## What Works Without MoviePy?

✅ **Everything except advanced video editing:**
- AI Script Generation (Gemini) 
- AI Video Creation (FAL.ai)
- Sound Effects (ElevenLabs)
- Voiceovers (ElevenLabs)
- Basic video combining (with ffmpeg)
- Social media posts

⚠️ **Limited:**
- Video stitching (basic only)
- Final video creation (needs ffmpeg)

## For Full Video Features

Install ffmpeg:
```bash
brew install ffmpeg  # Mac
sudo apt-get install ffmpeg  # Linux
```

## Or Use Python 3.11

For ALL features including MoviePy:
```bash
conda create -n admaker python=3.11
conda activate admaker
pip install -r requirements.txt
```

---

**Bottom line:** Just run `pip install -r requirements_minimal.txt` and you're good to go! 🚀
