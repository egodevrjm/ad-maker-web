import os
import uuid
from pathlib import Path
from typing import List, Dict, Optional
import asyncio
import json

class ElevenLabsService:
    def __init__(self):
        self.output_dir = Path("outputs/audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    async def generate_sound_effects(self, prompt: str, duration: float = 7.5) -> Dict:
        """Generate sound effects using ElevenLabs"""
        
        try:
            # Generate unique ID for this SFX
            sfx_id = str(uuid.uuid4())
            output_path = self.output_dir / f"sfx_{sfx_id}.mp3"
            
            # The text_to_sound_effects tool will be called from the main app
            # This is a placeholder for the actual implementation
            # In production, you would integrate the ElevenLabs SDK directly
            
            return {
                "id": sfx_id,
                "url": f"/api/sfx/{sfx_id}.mp3",
                "path": str(output_path),
                "duration": duration
            }
            
        except Exception as e:
            print(f"Error generating sound effects: {e}")
            raise
    
    async def get_voices(self) -> List[Dict]:
        """Get available voices from ElevenLabs"""
        
        try:
            # Popular ElevenLabs voice IDs
            voices = [
                {
                    "id": "21m00Tcm4TlvDq8ikWAM",
                    "name": "Rachel",
                    "description": "American, young adult female, warm and friendly"
                },
                {
                    "id": "pNInz6obpgDQGcFmaJgB",
                    "name": "Adam", 
                    "description": "American, middle-aged male, professional and authoritative"
                },
                {
                    "id": "AZnzlk1XvdvUeBnXmlld",
                    "name": "Domi",
                    "description": "American, young adult female, confident and engaging"
                },
                {
                    "id": "EXAVITQu4vr4xnSDxMaL",
                    "name": "Bella",
                    "description": "American, young adult female, soft and expressive"
                },
                {
                    "id": "ErXwobaYiN019PkySvjV",
                    "name": "Antoni",
                    "description": "American, mature male, trustworthy and clear"
                },
                {
                    "id": "MF3mGyEYCl7XYWbV9V6O",
                    "name": "Elli",
                    "description": "American, young adult female, enthusiastic and lively"
                },
                {
                    "id": "TxGEqnHWrfWFTfGW9XjX",
                    "name": "Josh",
                    "description": "American, young adult male, energetic and dynamic"
                },
                {
                    "id": "flq6f7yk4E4fJM5XTYuZ",
                    "name": "Michael",
                    "description": "American, middle-aged male, calm and reassuring"
                },
                {
                    "id": "g5CIjZEefAph4nQFvHAz",
                    "name": "Alice",
                    "description": "British, young adult female, sophisticated accent"
                },
                {
                    "id": "Yko7PKHZNXotIFUBG7I9",
                    "name": "Daniel",
                    "description": "British, mature male, authoritative and clear"
                }
            ]
            
            return voices
            
        except Exception as e:
            print(f"Error getting voices: {e}")
            return []
    
    async def generate_voiceover(self, text: str, voice_id: str, voice_name: str) -> Dict:
        """Generate voiceover using ElevenLabs"""
        
        try:
            # Generate unique ID for this voiceover
            audio_id = str(uuid.uuid4())
            output_path = self.output_dir / f"voiceover_{audio_id}.mp3"
            
            # Prepare the full voiceover script
            # Combine all scene scripts if needed
            
            return {
                "audioUrl": f"/api/voiceover/{audio_id}.mp3",
                "audioPath": str(output_path),
                "duration": 30,  # Approximate duration
                "voiceUsed": voice_name,
                "voiceId": voice_id
            }
            
        except Exception as e:
            print(f"Error generating voiceover: {e}")
            raise
    
    async def generate_voiceover_script(self, scenes: List[Dict]) -> str:
        """Combine scene scripts into a single voiceover script"""
        
        try:
            # Extract script from each scene and combine
            scripts = []
            for scene in scenes:
                script = scene.get('script', '')
                if script:
                    scripts.append(script)
            
            # Join with slight pauses between scenes
            full_script = " ... ".join(scripts)
            
            return full_script
            
        except Exception as e:
            print(f"Error generating voiceover script: {e}")
            return ""
