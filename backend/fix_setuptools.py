#!/usr/bin/env python3
"""
Alternative fix: Update setuptools and wheel before installing
Sometimes the pkgutil.ImpImporter error is due to old setuptools
"""

import subprocess
import sys

def main():
    print("="*60)
    print("Trying Alternative Fix: Update Build Tools")
    print("="*60)
    
    print("\n1. Updating pip, setuptools, and wheel...")
    
    # Update core packages
    core_packages = ["pip", "setuptools", "wheel"]
    for pkg in core_packages:
        print(f"   Updating {pkg}...")
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", pkg])
    
    print("\n2. Installing requirements without MoviePy...")
    
    # Install minimal requirements
    result = subprocess.run([
        sys.executable, "-m", "pip", "install", 
        "-r", "requirements_minimal.txt"
    ])
    
    if result.returncode == 0:
        print("\n✅ Success! You can now run: python main.py")
    else:
        print("\n❌ Still having issues. Try:")
        print("   pip install --no-build-isolation -r requirements_minimal.txt")
    
    print("="*60)

if __name__ == "__main__":
    main()
