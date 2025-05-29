from google import genai
from google.genai import types
import os
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

class GeminiServiceV2:
    """Simplified Gemini service using the new Google GenAI SDK"""
    
    def __init__(self):
        # Use the new Google GenAI client
        self.client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
        self.model = 'gemini-2.0-flash-001'
    
    async def enhance_product_idea(self, idea: str, mood: str, audience: str) -> str:
        """Enhance a product idea using Gemini"""
        
        prompt = f"""
        Enhance this product idea to make it more compelling:
        
        Original idea: {idea}
        Target mood: {mood}
        Target audience: {audience}
        
        Make it:
        1. Clear and specific about the value proposition
        2. Appeal to {audience}
        3. Match the {mood.lower()} tone
        4. Be memorable and marketable
        
        Keep it to 2-3 sentences.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=200
                )
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini error: {e}")
            return f"{idea} - Enhanced for {audience} with a {mood.lower()} approach."
    
    async def generate_script(self, product_name: str, target_audience: str, key_message: str, mood: str = "Professional") -> List[Dict]:
        """Generate a 4-scene commercial script"""
        
        prompt = f"""
        Create a 30-second commercial script with exactly 4 scenes.
        
        Product: {product_name}
        Audience: {target_audience}
        Key Message: {key_message}
        Mood: {mood}
        
        Return a JSON array with 4 scenes, each with:
        - number: 1-4
        - duration: 5
        - script: What the voiceover says
        - videoPrompt: Visual description for video generation
        - sfxPrompt: Sound effects description
        
        Example format:
        [{{"number": 1, "duration": 5, "script": "...", "videoPrompt": "...", "sfxPrompt": "..."}}]
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.8,
                    response_mime_type="application/json"
                )
            )
            
            import json
            scenes = json.loads(response.text)
            
            # Ensure all scenes have required fields
            for i, scene in enumerate(scenes):
                scene['number'] = i + 1
                scene['duration'] = 7.5
            
            return scenes
            
        except Exception as e:
            print(f"Script generation error: {e}")
            return self._get_fallback_script(product_name, target_audience, key_message, mood)
    
    def _get_fallback_script(self, product_name: str, target_audience: str, key_message: str, mood: str) -> List[Dict]:
        """Fallback script if API fails"""
        mood_styles = {
            "Energetic": "exciting and dynamic",
            "Professional": "polished and trustworthy",
            "Humorous": "fun and playful",
            "Emotional": "heartfelt and touching",
            "Inspirational": "uplifting and motivational"
        }
        
        style = mood_styles.get(mood, "engaging")
        
        return [
            {
                "number": 1,
                "duration": 7.5,
                "script": f"In a world where {target_audience} need real solutions...",
                "videoPrompt": f"Opening scene showing {target_audience} facing daily challenges, {style} visual style",
                "sfxPrompt": f"{mood} music building up, environmental sounds"
            },
            {
                "number": 2,
                "duration": 7.5,
                "script": f"Introducing {product_name} - {key_message}",
                "videoPrompt": f"Product reveal with {style} presentation, showing key features",
                "sfxPrompt": f"Music transitions to hopeful tone, product sound effects"
            },
            {
                "number": 3,
                "duration": 7.5,
                "script": f"See how {product_name} transforms your experience",
                "videoPrompt": f"Happy customers using product, {style} testimonials",
                "sfxPrompt": f"Uplifting music, success sounds"
            },
            {
                "number": 4,
                "duration": 7.5,
                "script": f"Join thousands who've already made the switch. {product_name} - your solution is here.",
                "videoPrompt": f"Call to action with {style} ending, website/logo display",
                "sfxPrompt": f"Music reaches {mood.lower()} crescendo, memorable closing"
            }
        ]
    
    async def generate_social_posts(self, product_name: str, target_audience: str, key_message: str) -> Dict[str, str]:
        """Generate social media posts"""
        
        prompt = f"""
        Create social media posts for:
        Product: {product_name}
        Audience: {target_audience}
        Message: {key_message}
        
        Create:
        1. Twitter post (280 chars max) with hashtags
        2. LinkedIn post (professional, longer)
        
        Return as JSON: {{"twitter": "...", "linkedin": "..."}}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    response_mime_type="application/json"
                )
            )
            
            import json
            return json.loads(response.text)
            
        except Exception as e:
            print(f"Social posts error: {e}")
            return {
                "twitter": f"🚀 {product_name} is here! {key_message} Perfect for {target_audience}. #Innovation",
                "linkedin": f"Excited to announce {product_name}! {key_message} Designed for {target_audience}."
            }
