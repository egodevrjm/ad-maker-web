#!/usr/bin/env python3
"""
Smart installer that detects Python version and installs appropriate packages
"""

import sys
import subprocess
import os

def main():
    py_version = sys.version_info
    print("="*60)
    print("Ad Maker Wizard - Smart Installer")
    print("="*60)
    print(f"Detected Python {py_version.major}.{py_version.minor}.{py_version.micro}")
    
    if py_version.major == 3 and py_version.minor >= 12:
        print("\n⚠️  Python 3.12+ detected")
        print("MoviePy is not compatible with Python 3.12 yet.")
        print("Installing minimal requirements...\n")
        
        req_file = "requirements_minimal.txt"
        cmd = [sys.executable, "-m", "pip", "install", "-r", req_file]
    else:
        print("\n✅ Python < 3.12 detected")
        print("Installing full requirements...\n")
        
        req_file = "requirements.txt"
        cmd = [sys.executable, "-m", "pip", "install", "-r", req_file]
    
    # Run pip install
    print(f"Running: pip install -r {req_file}")
    print("-"*40)
    
    result = subprocess.run(cmd)
    
    print("\n" + "="*60)
    if result.returncode == 0:
        print("✅ Installation successful!")
        print("\nYou can now run: python main.py")
    else:
        print("❌ Some packages failed to install")
        print("\nTry the quick fix instead:")
        print("  python quickfix_py312.py")
    print("="*60)

if __name__ == "__main__":
    main()
