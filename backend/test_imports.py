#!/usr/bin/env python3
"""
Minimal test to see if basic dependencies work
"""

print("Testing basic imports...")

try:
    import fastapi
    print("✅ FastAPI imported")
except ImportError as e:
    print(f"❌ FastAPI import failed: {e}")

try:
    import uvicorn
    print("✅ Uvicorn imported")
except ImportError as e:
    print(f"❌ Uvicorn import failed: {e}")

try:
    import pydantic
    print("✅ Pydantic imported")
except ImportError as e:
    print(f"❌ Pydantic import failed: {e}")

try:
    from moviepy.editor import VideoFileClip
    print("✅ MoviePy imported")
except ImportError as e:
    print(f"⚠️  MoviePy import failed (expected on Python 3.12): {e}")

print("\nIf FastAPI imported successfully, you can run the app!")
print("MoviePy is optional - the app will work without it.")
