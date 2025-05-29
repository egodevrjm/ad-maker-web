#!/usr/bin/env python3
"""
Test Gemini API directly - helps diagnose API issues
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_old_sdk():
    """Test with old google-generativeai SDK"""
    print("Testing OLD SDK (google-generativeai)...")
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        model = genai.GenerativeModel('gemini-pro')
        
        response = model.generate_content("Say hello in 5 words")
        print(f"✅ Old SDK works: {response.text}")
        
    except Exception as e:
        print(f"❌ Old SDK error: {e}")

def test_new_sdk():
    """Test with new google-genai SDK"""
    print("\nTesting NEW SDK (google-genai)...")
    try:
        from google import genai
        
        client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-001',
            contents='Say hello in 5 words'
        )
        print(f"✅ New SDK works: {response.text}")
        
    except Exception as e:
        print(f"❌ New SDK error: {e}")

def test_direct_api():
    """Test with direct API call"""
    print("\nTesting Direct API call...")
    try:
        import requests
        
        api_key = os.getenv('GOOGLE_API_KEY')
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": "Say hello in 5 words"
                }]
            }]
        }
        
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            result = response.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            print(f"✅ Direct API works: {text}")
        else:
            print(f"❌ Direct API error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Direct API error: {e}")

def main():
    print("="*60)
    print("Gemini API Test")
    print("="*60)
    
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("❌ GOOGLE_API_KEY not found in environment!")
        print("   Add it to your .env file")
        return
    
    print(f"✅ API Key found: {api_key[:10]}...")
    print()
    
    # Test different methods
    test_old_sdk()
    test_new_sdk()
    test_direct_api()
    
    print("\n" + "="*60)
    print("Test complete!")
    print("="*60)

if __name__ == "__main__":
    main()
