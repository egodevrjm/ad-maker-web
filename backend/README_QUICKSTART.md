# ⚡ Quick Start for Python 3.12 Users

The error `AttributeError: module 'pkgutil' has no attribute 'ImpImporter'` happens because MoviePy doesn't support Python 3.12 yet.

## Immediate Solution (Copy & Paste)

```bash
cd /Users//Code/ad-maker-web/backend
pip install -r requirements_minimal.txt
python main.py
```

That's it! The app will run without MoviePy. 🎉

## If That Doesn't Work

Try updating your build tools first:
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements_minimal.txt
```

## Test Your Setup

Check what's working:
```bash
python test_imports.py
```

## Install ffmpeg for Video Features

Even without MoviePy, you can process videos with ffmpeg:
```bash
brew install ffmpeg
```

## Files I Created to Help You

- `requirements_minimal.txt` - Requirements without MoviePy ✅
- `quickfix_py312.py` - Automated installer
- `smart_install.py` - Auto-detects Python version
- `test_imports.py` - Test what's working
- `PYTHON_312_GUIDE.md` - Detailed guide
- `video_service_py312.py` - Video processing without MoviePy

## The App Will Still Work!

The backend has been updated to handle missing MoviePy gracefully. All AI features work perfectly:
- ✅ Gemini script generation
- ✅ FAL.ai video generation  
- ✅ ElevenLabs audio
- ✅ Basic video processing (with ffmpeg)

Just install the minimal requirements and start creating commercials! 🚀
