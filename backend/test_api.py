#!/usr/bin/env python3
"""
Test script for Ad Maker Wizard API
Run this to verify all integrations are working

IMPORTANT: Make sure the backend server is running before running this script!
Start the backend with: python main.py
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"

def check_server_running():
    """Check if the backend server is running"""
    try:
        response = requests.get(f"{BASE_URL}/api/status", timeout=2)
        return response.status_code == 200
    except:
        return False

def test_api_status():
    """Test if API is running"""
    print("Testing API status...")
    try:
        response = requests.get(f"{BASE_URL}/api/status")
        if response.status_code == 200:
            data = response.json()
            print("✅ API Status:", data["status"])
            print("   Services:", json.dumps(data.get("services", {}), indent=2))
        else:
            print("❌ API Status check failed")
    except Exception as e:
        print("❌ API Status check failed:", str(e))
    print()

def test_enhance_idea():
    """Test AI idea enhancement"""
    print("Testing idea enhancement...")
    payload = {
        "idea": "A smart water bottle that tracks hydration",
        "mood": "Energetic",
        "audience": "Young Professionals"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/enhance-product-idea", json=payload)
        if response.status_code == 200:
            data = response.json()
            enhanced = data.get("enhancedIdea", "")
            print(f"✅ Enhanced idea: {enhanced[:100]}...")
            return enhanced
        else:
            print("❌ Idea enhancement failed:", response.text)
    except Exception as e:
        print("❌ Idea enhancement failed:", str(e))
    print()
    return ""

def test_script_generation():
    """Test Gemini script generation"""
    print("Testing script generation...")
    payload = {
        "productName": "TaskMaster Pro",
        "targetAudience": "busy professionals",
        "keyMessage": "AI-powered productivity that saves 10 hours per week",
        "mood": "Professional"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/generate-script", json=payload)
        if response.status_code == 200:
            data = response.json()
            scenes = data.get("scenes", [])
            print(f"✅ Generated {len(scenes)} scenes")
            for i, scene in enumerate(scenes):
                print(f"   Scene {i+1}: {scene.get('script', '')[:50]}...")
            return scenes
        else:
            print("❌ Script generation failed:", response.text)
    except Exception as e:
        print("❌ Script generation failed:", str(e))
    print()
    return []

def test_voice_list():
    """Test ElevenLabs voice listing"""
    print("Testing voice listing...")
    try:
        response = requests.get(f"{BASE_URL}/api/voices")
        if response.status_code == 200:
            data = response.json()
            voices = data.get("voices", [])
            print(f"✅ Found {len(voices)} voices")
            for voice in voices[:3]:
                print(f"   - {voice['name']}: {voice['description']}")
            return voices
        else:
            print("❌ Voice listing failed")
    except Exception as e:
        print("❌ Voice listing failed:", str(e))
    print()
    return []

def test_video_generation(scene):
    """Test FAL.ai video generation"""
    print("Testing video generation...")
    payload = {
        "prompt": scene.get("videoPrompt", "A test video prompt"),
        "duration": 7.5,
        "sceneNumber": 1
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/generate-video", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Video generated: {data.get('videoUrl', 'N/A')}")
            return data
        else:
            print("❌ Video generation failed")
    except Exception as e:
        print("❌ Video generation failed:", str(e))
    print()
    return {}

def test_sfx_generation(scene):
    """Test ElevenLabs sound effects generation"""
    print("Testing sound effects generation...")
    payload = {
        "prompt": scene.get("sfxPrompt", "upbeat background music"),
        "duration": 7.5
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/generate-sfx", json=payload)
        if response.status_code == 200:
            data = response.json()
            sfx_list = data.get("soundEffects", [])
            print(f"✅ Generated {len(sfx_list)} sound effect options")
            return sfx_list
        else:
            print("❌ Sound effects generation failed")
    except Exception as e:
        print("❌ Sound effects generation failed:", str(e))
    print()
    return []

def test_voiceover_generation(scenes, voice):
    """Test ElevenLabs voiceover generation"""
    print("Testing voiceover generation...")
    
    # Combine all scene scripts
    full_script = " ... ".join([scene.get("script", "") for scene in scenes])
    
    payload = {
        "text": full_script,
        "voiceId": voice.get("id", "default"),
        "voiceName": voice.get("name", "Default Voice")
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/generate-voiceover", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Voiceover generated: {data.get('audioUrl', 'N/A')}")
            print(f"   Voice: {data.get('voiceUsed', 'Unknown')}")
            return data
        else:
            print("❌ Voiceover generation failed")
    except Exception as e:
        print("❌ Voiceover generation failed:", str(e))
    print()
    return {}

def test_social_posts():
    """Test Gemini social post generation"""
    print("Testing social post generation...")
    payload = {
        "productName": "TaskMaster Pro",
        "targetAudience": "busy professionals",
        "keyMessage": "AI-powered productivity"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/generate-social-posts", json=payload)
        if response.status_code == 200:
            data = response.json()
            posts = data.get("posts", {})
            print("✅ Social posts generated")
            if "twitter" in posts:
                print(f"   Twitter: {posts['twitter'][:100]}...")
            if "linkedin" in posts:
                print(f"   LinkedIn: {posts['linkedin'][:100]}...")
        else:
            print("❌ Social post generation failed")
    except Exception as e:
        print("❌ Social post generation failed:", str(e))
    print()

def main():
    """Run all tests"""
    print("=" * 60)
    print("AD MAKER WIZARD API TEST SUITE")
    print("=" * 60)
    print()
    
    # Check if server is running
    if not check_server_running():
        print("❌ ERROR: Backend server is not running!")
        print()
        print("Please start the backend server first:")
        print("  1. Open a new terminal")
        print("  2. Navigate to: /Users//Code/ad-maker-web/backend")
        print("  3. Run: python main.py")
        print()
        print("Or use the startup script from the project root:")
        print("  cd /Users//Code/ad-maker-web")
        print("  python start.py")
        print()
        print("=" * 60)
        sys.exit(1)
    
    # Test API status
    test_api_status()
    
    # Test idea enhancement
    enhanced_idea = test_enhance_idea()
    
    # Test script generation
    scenes = test_script_generation()
    
    # Test voice listing
    voices = test_voice_list()
    
    if scenes and voices:
        # Test video generation for first scene
        video = test_video_generation(scenes[0])
        
        # Test sound effects
        sfx_list = test_sfx_generation(scenes[0])
        
        # Test voiceover
        voiceover = test_voiceover_generation(scenes, voices[0])
    
    # Test social posts
    test_social_posts()
    
    print("=" * 60)
    print("Test suite completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
