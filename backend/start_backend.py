#!/usr/bin/env python3
"""
Quick Backend Server Starter
Run this to start just the backend server for testing
"""

import subprocess
import sys
import os
from pathlib import Path

def check_dependencies(python_cmd):
    """Check if FastAPI is installed"""
    try:
        subprocess.run(
            [python_cmd, "-c", "import fastapi"],
            check=True,
            capture_output=True
        )
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    # Get the backend directory
    backend_dir = Path(__file__).parent
    
    # Check if we're in the backend directory
    if not (backend_dir / "main.py").exists():
        print("Error: main.py not found. Make sure you're in the backend directory.")
        sys.exit(1)
    
    # Check for virtual environment
    venv_path = backend_dir / "venv"
    if sys.platform == "win32":
        python_exe = venv_path / "Scripts" / "python.exe"
    else:
        python_exe = venv_path / "bin" / "python"
    
    # Use venv Python if available, otherwise system Python
    if python_exe.exists():
        python_cmd = str(python_exe)
        print(f"Using virtual environment Python: {python_cmd}")
    else:
        python_cmd = sys.executable
        print(f"Using system Python: {python_cmd}")
    
    # Check if dependencies are installed
    if not check_dependencies(python_cmd):
        print("\n" + "="*60)
        print("❌ ERROR: Dependencies not installed!")
        print("="*60)
        print("\nFastAPI and other dependencies are missing.")
        print("\nPlease run one of these commands first:")
        print("\n1. Full setup (recommended):")
        print("   python setup.py")
        print("\n2. Quick install (current environment):")
        print("   python quick_install.py")
        print("\n3. Manual install:")
        if python_exe.exists():
            print(f"   {python_cmd} -m pip install -r requirements.txt")
        else:
            print("   pip install -r requirements.txt")
        print("="*60)
        sys.exit(1)
    
    print("\n" + "="*60)
    print("Starting Ad Maker Wizard Backend Server")
    print("="*60)
    print(f"Server will run at: http://localhost:8000")
    print(f"API Docs available at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    try:
        # Start the backend server
        subprocess.run([python_cmd, "main.py"], cwd=backend_dir)
    except KeyboardInterrupt:
        print("\n\nServer stopped.")

if __name__ == "__main__":
    main()
