#!/usr/bin/env python3
"""
Dependency checker for Ad Maker Wizard
Checks all system and Python dependencies
"""

import subprocess
import sys
import importlib
import shutil

def check_command(cmd):
    """Check if a system command exists"""
    return shutil.which(cmd) is not None

def check_python_package(package):
    """Check if a Python package is installed"""
    try:
        importlib.import_module(package)
        return True
    except ImportError:
        return False

def main():
    print("="*60)
    print("Ad Maker Wizard Dependency Check")
    print("="*60)
    print()
    
    # Check Python version
    print("Python Version:")
    print(f"  {sys.version}")
    if sys.version_info < (3, 7):
        print("  ❌ Python 3.7+ required")
    else:
        print("  ✅ Python version OK")
    print()
    
    # Check system dependencies
    print("System Dependencies:")
    
    # ffmpeg (required for MoviePy)
    if check_command("ffmpeg"):
        print("  ✅ ffmpeg installed (required for video processing)")
    else:
        print("  ❌ ffmpeg NOT installed")
        print("     Install with:")
        print("     - Mac: brew install ffmpeg")
        print("     - Ubuntu: sudo apt-get install ffmpeg")
        print("     - Windows: Download from https://ffmpeg.org")
    print()
    
    # Check Python packages
    print("Python Packages:")
    packages = {
        "fastapi": "FastAPI web framework",
        "uvicorn": "ASGI server",
        "pydantic": "Data validation",
        "google.generativeai": "Google Gemini API",
        "fal_client": "FAL.ai API",
        "moviepy": "Video processing",
        "PIL": "Image processing (Pillow)",
        "requests": "HTTP requests",
        "dotenv": "Environment variables"
    }
    
    missing_packages = []
    for package, description in packages.items():
        if check_python_package(package):
            print(f"  ✅ {package} - {description}")
        else:
            print(f"  ❌ {package} - {description}")
            missing_packages.append(package)
    
    print()
    print("="*60)
    
    if missing_packages:
        print("❌ Some dependencies are missing!")
        print()
        print("To install missing Python packages, run:")
        print("  python setup.py")
        print("OR")
        print("  pip install -r requirements.txt")
    else:
        print("✅ All Python dependencies installed!")
        
    if not check_command("ffmpeg"):
        print()
        print("⚠️  Warning: ffmpeg is required for video processing")
        print("   The app will run but video features may fail")
    
    print("="*60)

if __name__ == "__main__":
    main()
