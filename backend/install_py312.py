#!/usr/bin/env python3
"""
Python 3.12 Compatible Installer
Installs packages that work with Python 3.12
"""

import subprocess
import sys
import os

def get_python_version():
    """Get Python version info"""
    version_info = sys.version_info
    return f"{version_info.major}.{version_info.minor}.{version_info.micro}"

def install_package(package):
    """Install a single package"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("="*60)
    print("Ad Maker Wizard - Python 3.12 Compatible Installer")
    print("="*60)
    print(f"\nPython version: {get_python_version()}")
    
    if sys.version_info.major == 3 and sys.version_info.minor >= 12:
        print("✅ Python 3.12+ detected")
        print("\nInstalling compatible packages...")
    else:
        print("ℹ️  Python < 3.12 detected")
        print("   You can use the regular requirements.txt")
    
    print("\n" + "-"*40)
    
    # Essential packages that work with Python 3.12
    packages = [
        # Core packages
        ("fastapi==0.104.1", "FastAPI web framework"),
        ("uvicorn[standard]==0.24.0", "ASGI server"),
        ("python-multipart==0.0.6", "Form data support"),
        ("pydantic==2.5.0", "Data validation"),
        ("python-dotenv==1.0.0", "Environment variables"),
        ("aiofiles==23.2.1", "Async file operations"),
        
        # Image/Video processing (MoviePy alternatives)
        ("Pillow==10.1.0", "Image processing"),
        ("opencv-python==4.8.1.78", "Video processing"),
        ("imageio==2.33.0", "Image/Video I/O"),
        ("imageio-ffmpeg==0.4.9", "FFmpeg wrapper"),
        
        # AI/API packages
        ("numpy==1.26.0", "Numerical computing"),
        ("google-generativeai==0.3.0", "Google Gemini"),
        ("fal-client==0.2.0", "FAL.ai client"),
        
        # HTTP/Network
        ("requests==2.31.0", "HTTP requests"),
        ("httpx==0.25.2", "Async HTTP client"),
    ]
    
    failed_packages = []
    
    for package, description in packages:
        print(f"\nInstalling {package} - {description}...")
        if install_package(package):
            print(f"✅ {package} installed")
        else:
            print(f"❌ Failed to install {package}")
            failed_packages.append(package)
    
    print("\n" + "="*60)
    
    if failed_packages:
        print("⚠️  Some packages failed to install:")
        for pkg in failed_packages:
            print(f"   - {pkg}")
        print("\nTry installing them manually:")
        print(f"   pip install {' '.join(failed_packages)}")
    else:
        print("✅ All packages installed successfully!")
    
    print("\n⚠️  Note: MoviePy is not compatible with Python 3.12 yet.")
    print("   Video processing will use OpenCV as a fallback.")
    print("\n✅ You can now run: python main.py")
    print("="*60)

if __name__ == "__main__":
    main()
