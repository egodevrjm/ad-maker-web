#!/usr/bin/env python3
"""
Setup script for Ad Maker Wizard Backend
This script creates a virtual environment and installs all dependencies
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        subprocess.run(cmd, check=True, cwd=cwd)
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    backend_dir = Path(__file__).parent
    venv_path = backend_dir / "venv"
    
    print("="*60)
    print("Ad Maker Wizard Backend Setup")
    print("="*60)
    print()
    
    # Step 1: Create virtual environment if it doesn't exist
    if not venv_path.exists():
        print("1. Creating virtual environment...")
        if not run_command([sys.executable, "-m", "venv", "venv"], cwd=backend_dir):
            print("❌ Failed to create virtual environment")
            print("   Try: python3 -m pip install --upgrade pip")
            sys.exit(1)
        print("✅ Virtual environment created")
    else:
        print("✅ Virtual environment already exists")
    
    # Step 2: Determine pip executable
    if sys.platform == "win32":
        pip_exe = venv_path / "Scripts" / "pip.exe"
        python_exe = venv_path / "Scripts" / "python.exe"
    else:
        pip_exe = venv_path / "bin" / "pip"
        python_exe = venv_path / "bin" / "python"
    
    # Step 3: Upgrade pip
    print("\n2. Upgrading pip...")
    run_command([str(python_exe), "-m", "pip", "install", "--upgrade", "pip"], cwd=backend_dir)
    print("✅ Pip upgraded")
    
    # Step 4: Install requirements
    print("\n3. Installing requirements...")
    requirements_file = backend_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found!")
        sys.exit(1)
    
    print("   This may take a few minutes...")
    if not run_command([str(pip_exe), "install", "-r", "requirements.txt"], cwd=backend_dir):
        print("❌ Failed to install some requirements")
        print("   Try installing them one by one")
    else:
        print("✅ All requirements installed")
    
    # Step 5: Check installation
    print("\n4. Checking installation...")
    check_cmd = [str(python_exe), "-c", "import fastapi; import uvicorn; print('✅ Core packages installed')"]
    run_command(check_cmd, cwd=backend_dir)
    
    print("\n" + "="*60)
    print("Setup complete!")
    print("="*60)
    print("\nTo start the backend server:")
    print(f"  cd {backend_dir}")
    if sys.platform == "win32":
        print("  venv\\Scripts\\activate")
    else:
        print("  source venv/bin/activate")
    print("  python main.py")
    print("\nOr use the quick start script:")
    print("  python start_backend.py")
    print("="*60)

if __name__ == "__main__":
    main()
