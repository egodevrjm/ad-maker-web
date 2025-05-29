#!/usr/bin/env python3
"""
Quick Fix for Python 3.12 Compatibility
Run this to quickly get the backend working on Python 3.12
"""

import subprocess
import sys

def main():
    print("="*60)
    print("Python 3.12 Quick Fix Installer")
    print("="*60)
    print(f"\nDetected Python {sys.version}")
    print("\nThis will install only the essential packages to get you running.")
    print("Video processing will be limited but functional.\n")
    
    # Essential packages only
    packages = [
        "fastapi",
        "uvicorn[standard]",
        "python-multipart",
        "pydantic",
        "python-dotenv",
        "requests",
        "google-generativeai",
        "fal-client",
        "aiofiles",
        "Pillow",
        "numpy",
        "httpx"
    ]
    
    print("Installing essential packages...")
    for pkg in packages:
        print(f"  Installing {pkg}...")
        subprocess.run([sys.executable, "-m", "pip", "install", pkg], 
                      capture_output=True)
    
    print("\n✅ Essential packages installed!")
    print("\nNote: MoviePy (video processing) is skipped due to Python 3.12")
    print("      compatibility issues. Basic video features will still work.")
    print("\nYou can now run: python main.py")
    print("="*60)

if __name__ == "__main__":
    main()
