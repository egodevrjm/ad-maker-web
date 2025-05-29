import requests
import os
import uuid
from pathlib import Path
from typing import List, Dict, Optional
import asyncio
import json
from dotenv import load_dotenv

load_dotenv()

class ElevenLabsDirectService:
    def __init__(self):
        self.api_key = os.getenv('ELEVENLABS_API_KEY')
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        self.output_dir = Path("outputs/audio")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def generate_sound_effects(self, prompt: str, duration: float = 7.5) -> List[Dict]:
        """Generate multiple sound effect variations"""
        
        sfx_options = []
        
        # Generate 4 variations
        variations = [
            prompt,
            f"{prompt} with more intensity",
            f"{prompt} with subtle variations", 
            f"{prompt} with different mood"
        ]
        
        for i, variation_prompt in enumerate(variations):
            try:
                sfx_id = str(uuid.uuid4())
                output_path = self.output_dir / f"sfx_{sfx_id}.mp3"
                
                # Call ElevenLabs sound effects API
                url = f"{self.base_url}/sound-generation"
                
                payload = {
                    "text": variation_prompt,
                    "duration_seconds": duration,
                    "output_format": "mp3_44100_128"
                }
                
                response = requests.post(url, json=payload, headers=self.headers)
                
                if response.status_code == 200:
                    # Save the audio file
                    with open(output_path, 'wb') as f:
                        f.write(response.content)
                    
                    sfx_options.append({
                        "id": sfx_id,
                        "url": f"/api/sfx/{sfx_id}.mp3",
                        "name": f"Option {i + 1}",
                        "path": str(output_path)
                    })
                else:
                    print(f"Error generating SFX: {response.status_code} - {response.text}")
                    # Add placeholder
                    sfx_options.append({
                        "id": sfx_id,
                        "url": f"/api/sfx/{sfx_id}.mp3",
                        "name": f"Option {i + 1}"
                    })
                    
            except Exception as e:
                print(f"Error generating SFX variation {i}: {e}")
                sfx_id = str(uuid.uuid4())
                sfx_options.append({
                    "id": sfx_id,
                    "url": f"/api/sfx/{sfx_id}.mp3",
                    "name": f"Option {i + 1}"
                })
        
        return sfx_options
    
    async def get_voices(self) -> List[Dict]:
        """Get available voices from ElevenLabs"""
        
        try:
            url = f"{self.base_url}/voices"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                voices = []
                
                # Filter for high-quality voices
                for voice in data.get('voices', [])[:10]:  # Limit to 10 voices
                    voices.append({
                        "id": voice['voice_id'],
                        "name": voice['name'],
                        "description": f"{voice.get('labels', {}).get('accent', 'Unknown accent')}, {voice.get('labels', {}).get('age', 'Unknown age')}, {voice.get('labels', {}).get('gender', 'Unknown gender')}"
                    })
                
                return voices
            else:
                print(f"Error fetching voices: {response.status_code}")
                return self._get_default_voices()
                
        except Exception as e:
            print(f"Error getting voices: {e}")
            return self._get_default_voices()
    
    def _get_default_voices(self) -> List[Dict]:
        """Return default voice list as fallback"""
        return [
            {"id": "21m00Tcm4TlvDq8ikWAM", "name": "Rachel", "description": "American, young adult female"},
            {"id": "pNInz6obpgDQGcFmaJgB", "name": "Adam", "description": "American, middle-aged male"},
            {"id": "AZnzlk1XvdvUeBnXmlld", "name": "Domi", "description": "American, young adult female"},
            {"id": "EXAVITQu4vr4xnSDxMaL", "name": "Bella", "description": "American, young adult female"},
            {"id": "ErXwobaYiN019PkySvjV", "name": "Antoni", "description": "American, mature male"},
            {"id": "MF3mGyEYCl7XYWbV9V6O", "name": "Elli", "description": "American, young adult female"}
        ]
    
    async def generate_voiceover(self, text: str, voice_id: str, voice_name: str) -> Dict:
        """Generate voiceover using ElevenLabs text-to-speech"""
        
        try:
            audio_id = str(uuid.uuid4())
            output_path = self.output_dir / f"voiceover_{audio_id}.mp3"
            
            # Call ElevenLabs TTS API
            url = f"{self.base_url}/text-to-speech/{voice_id}"
            
            payload = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
            
            headers = {
                **self.headers,
                "Accept": "audio/mpeg"
            }
            
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                # Save the audio file
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                return {
                    "audioUrl": f"/api/voiceover/{audio_id}.mp3",
                    "audioPath": str(output_path),
                    "duration": 30,  # Approximate
                    "voiceUsed": voice_name
                }
            else:
                print(f"Error generating voiceover: {response.status_code} - {response.text}")
                return {
                    "audioUrl": f"/api/voiceover/{audio_id}.mp3",
                    "audioPath": str(output_path),
                    "duration": 30,
                    "voiceUsed": voice_name,
                    "error": "Failed to generate voiceover"
                }
                
        except Exception as e:
            print(f"Error generating voiceover: {e}")
            audio_id = str(uuid.uuid4())
            return {
                "audioUrl": f"/api/voiceover/{audio_id}.mp3",
                "duration": 30,
                "voiceUsed": voice_name,
                "error": str(e)
            }
