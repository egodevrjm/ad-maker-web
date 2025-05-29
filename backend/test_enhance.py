#!/usr/bin/env python3
"""
Test the enhanced product idea generation
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
from services.gemini_service import GeminiService

# Load environment variables
load_dotenv()

async def test_enhancement():
    print("=== Testing Enhanced Product Idea Generation ===\n")
    
    service = GeminiService()
    
    # Test cases with vague ideas
    test_cases = [
        {
            "idea": "something for productivity",
            "mood": "Professional",
            "audience": "Remote workers"
        },
        {
            "idea": "help people sleep better",
            "mood": "Calming",
            "audience": "Stressed professionals"
        },
        {
            "idea": "fitness tracker but different",
            "mood": "Energetic",
            "audience": "Busy parents"
        },
        {
            "idea": "make cooking easier",
            "mood": "Fun",
            "audience": "College students"
        },
        {
            "idea": "something for pets",
            "mood": "Playful",
            "audience": "Pet owners"
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\nTest {i}:")
        print(f"Original idea: {test['idea']}")
        print(f"Mood: {test['mood']}")
        print(f"Audience: {test['audience']}")
        print("-" * 50)
        
        try:
            enhanced = await service.enhance_product_idea(
                test['idea'],
                test['mood'],
                test['audience']
            )
            print(f"Enhanced idea:\n{enhanced}")
        except Exception as e:
            print(f"Error: {e}")
        
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_enhancement())
