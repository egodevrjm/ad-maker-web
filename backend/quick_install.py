#!/usr/bin/env python3
"""
Quick dependency installer for Ad Maker Wizard Backend
Installs all required packages in the current Python environment
"""

import subprocess
import sys
import os

def main():
    print("Installing Ad Maker Wizard backend dependencies...")
    print("="*60)
    
    # List of essential packages
    packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "python-multipart==0.0.6",
        "pydantic==2.5.0",
        "python-dotenv==1.0.0",
        "aiofiles==23.2.1",
        "Pillow==10.1.0",
        "moviepy==1.0.3",
        "numpy==1.24.3",
        "google-generativeai==0.3.0",
        "fal-client==0.2.0",
        "requests==2.31.0",
        "httpx==0.25.2"
    ]
    
    # Install packages
    for package in packages:
        print(f"\nInstalling {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} installed")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            print("   You may need to install it manually")
    
    print("\n" + "="*60)
    print("Installation complete!")
    print("Now you can run: python main.py")
    print("="*60)

if __name__ == "__main__":
    main()
