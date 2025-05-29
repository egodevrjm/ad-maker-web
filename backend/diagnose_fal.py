#!/usr/bin/env python3
"""
Diagnostic script to identify FAL.ai video generation issues
"""

import os
import sys
import asyncio
import json
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def diagnose():
    print("=== Ad Maker Web - FAL.ai Diagnostic ===\n")
    
    # 1. Check environment
    print("1. Environment Check:")
    api_key = os.getenv('FAL_API_KEY')
    print(f"   FAL_API_KEY present: {'✅ Yes' if api_key else '❌ No'}")
    if api_key:
        print(f"   API Key format: {api_key[:10]}...{api_key[-5:]}")
    print()
    
    # 2. Check Python backend
    print("2. Python Backend Check:")
    try:
        from services.fal_service import FalService
        print("   ✅ FalService imported successfully")
        
        # Test FAL service
        fal_service = FalService()
        print("   ✅ FalService initialized")
        
        # Try a test generation
        print("\n3. Testing Video Generation:")
        print("   Sending test prompt: 'A beautiful sunset over mountains'")
        
        result = await fal_service.generate_video(
            prompt="A beautiful sunset over mountains",
            scene_number=99,
            duration=5.0
        )
        
        print("\n   Result:")
        print(f"   - Success: {'✅' if not result.get('error') else '❌'}")
        print(f"   - Video URL: {result.get('videoUrl', 'None')}")
        if result.get('error'):
            print(f"   - Error: {result['error']}")
            
    except Exception as e:
        print(f"   ❌ Error: {type(e).__name__}: {str(e)}")
        import traceback
        print("\n   Traceback:")
        traceback.print_exc()
    
    print("\n4. Recommendations:")
    
    if not api_key:
        print("   ❌ Add FAL_API_KEY to backend/.env file")
        print("      Get your key from: https://fal.ai/dashboard")
    
    print("\n   🎯 RECOMMENDED: Use the Node.js backend instead!")
    print("      The Node.js backend has a tested, working FAL integration.")
    print("\n      To switch:")
    print("      1. Stop the Python backend (Ctrl+C)")
    print("      2. cd ../backend-node")
    print("      3. npm install")
    print("      4. node server.js")
    print("\n   The frontend will work with either backend without changes.")

if __name__ == "__main__":
    asyncio.run(diagnose())
