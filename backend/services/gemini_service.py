import google.generativeai as genai
import os
from typing import Dict, List
import json
from dotenv import load_dotenv

load_dotenv()

class GeminiService:
    def __init__(self):
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    async def generate_script(self, product_name: str, target_audience: str, key_message: str, mood: str = "Professional") -> List[Dict]:
        """Generate a 4-scene commercial script using Gemini"""
        
        prompt = f"""
        You are an award-winning commercial scriptwriter. Create a unique, compelling 30-second commercial script.
        
        Product: {product_name}
        Target Audience: {target_audience}
        Key Message: {key_message}
        Mood/Tone: {mood}
        
        IMPORTANT: Be CREATIVE and SPECIFIC. Avoid generic phrases like "in today's fast-paced world" or "face unique challenges".
        
        Create EXACTLY 4 scenes (7.5 seconds each) with:
        1. script: The voiceover/narration (make it punchy, specific to THIS product)
        2. videoPrompt: Detailed visuals (be cinematic and specific - describe actual shots)
        3. sfxPrompt: Sound design (specific sounds, not just "uplifting music")
        
        Make it {mood.lower()}:
        - Energetic = fast cuts, dynamic action, high energy
        - Nostalgic = warm filters, memory-like sequences
        - Quirky = unexpected angles, playful elements
        - Professional = clean, sophisticated, trustworthy
        - Emotional = human moments, touching scenes
        - Humorous = comedy timing, visual gags
        - Dramatic = cinematic shots, tension building
        - Inspirational = achievement moments, aspirational
        
        Return ONLY a JSON array, no other text:
        [
            {{
                "number": 1,
                "duration": 7.5,
                "script": "Specific, engaging narration here",
                "videoPrompt": "Detailed shot description with specific visuals",
                "sfxPrompt": "Specific sounds and music style"
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            print(f"=== Script Generation Response ===")
            print(f"Raw response: {response_text[:200]}...")
            
            # Clean up the response text
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0]
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0]
            
            # Try to find JSON array
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                scenes = json.loads(json_str)
                
                # Ensure all scenes have required fields
                for i, scene in enumerate(scenes):
                    scene['duration'] = 7.5
                    scene['number'] = scene.get('number', i + 1)
                
                print(f"✅ Generated {len(scenes)} unique scenes")
                return scenes
            else:
                raise ValueError("Could not parse JSON from response")
                
        except Exception as e:
            print(f"Error generating script with Gemini: {e}")
            print(f"Error type: {type(e).__name__}")
            print(f"API Key present: {bool(os.getenv('GOOGLE_API_KEY'))}")
            
            # Return more creative fallback based on actual product
            return self._generate_creative_fallback(product_name, target_audience, key_message, mood)
    
    def _generate_creative_fallback(self, product_name: str, target_audience: str, key_message: str, mood: str = "Professional") -> List[Dict]:
        """Generate creative fallback script based on mood"""
        
        mood_templates = {
            "Energetic": {
                "scene1": f"BOOM! Life moves fast for {target_audience}. Too fast.",
                "visual1": "Rapid montage: clock spinning, notifications flooding, energy drinks stacking",
                "sound1": "Heart-pumping electronic beat, swoosh sounds, notification pings building chaos",
                "scene2": f"Enter {product_name}. {key_message}",
                "visual2": "Product appears in slow-motion glory, background still chaotic but product is calm center",
                "sound2": "Beat drops to half-time, powerful bass hit on reveal",
                "scene3": f"Watch {target_audience} take control with {product_name}",
                "visual3": "Split screen transformation - chaos to calm, stress to success",
                "sound3": "Building electronic symphony, transformation sound effects",
                "scene4": f"{product_name}. Energy redirected. Success amplified.",
                "visual4": "Logo slam with particle effects, website URL with fire animation",
                "sound4": "Epic beat drop, crowd cheer, power-up sound"
            },
            "Nostalgic": {
                "scene1": f"Remember when {target_audience} had time to breathe?",
                "visual1": "Sepia-toned memories, old photos floating, simpler times montage",
                "sound1": "Vintage piano melody, old film projector sounds, gentle strings",
                "scene2": f"{product_name} brings that feeling back. {key_message}",
                "visual2": "Modern day with warm filter, product gently introduced with soft focus",
                "sound2": "Piano continues, modern elements blend in, comfort sounds",
                "scene3": f"See {target_audience} rediscovering what matters",
                "visual3": "Family moments, genuine smiles, product naturally integrated",
                "sound3": "Orchestra swells with hope, laughter in background",
                "scene4": f"{product_name}. Some things never go out of style.",
                "visual4": "Classic logo treatment, timeless design, gentle fade",
                "sound4": "Nostalgic melody resolves, warm final note"
            },
            "Quirky": {
                "scene1": f"Plot twist: {target_audience} are secretly ninjas. Productivity ninjas.",
                "visual1": "Office workers doing parkour over desks, dodging emails like shurikens",
                "sound1": "Comedic martial arts sounds, boing effects, kazoo melody",
                "scene2": f"Their secret weapon? {product_name}. {key_message}",
                "visual2": "Product appears with anime-style sparkles and speed lines",
                "sound2": "Magical transformation sound, record scratch, funk bass",
                "scene3": f"Now everyone wants to join the {product_name} dojo",
                "visual3": "Montage of people doing ridiculous 'training' with the product",
                "sound3": "Training montage music with silly sound effects",
                "scene4": f"{product_name}. Ninja-approved. {target_audience}-tested.",
                "visual4": "Logo with throwing star animation, URL in comic sans (ironically)",
                "sound4": "Gong sound, ninja vanish poof, mic drop"
            },
            "Professional": {
                "scene1": f"{target_audience} demand excellence. They deserve tools that deliver.",
                "visual1": "Sleek office environments, confident professionals, clean aesthetics",
                "sound1": "Sophisticated ambient music, subtle tech sounds",
                "scene2": f"Introducing {product_name}. {key_message}",
                "visual2": "Product showcase with premium lighting, UI demonstrations, elegant transitions",
                "sound2": "Music builds with corporate gravitas, interface sounds",
                "scene3": f"Leading organizations trust {product_name} to drive results",
                "visual3": "Success metrics visualizing, testimonial overlays, global reach imagery",
                "sound3": "Orchestral crescendo, success chimes, global ambience",
                "scene4": f"{product_name}. Professional grade. {target_audience} approved.",
                "visual4": "Prestigious logo animation, clean contact information, trust badges",
                "sound4": "Confident musical resolution, premium sound signature"
            },
            "Emotional": {
                "scene1": f"For {target_audience}, it's not about the what. It's about the why.",
                "visual1": "Close-ups of real human moments, struggles, hope in eyes",
                "sound1": "Soft piano, ambient room tone, heartbeat",
                "scene2": f"{product_name} understands. {key_message}",
                "visual2": "Product shown through emotional lens, gentle hands, care in design",
                "sound2": "Strings join piano, emotional swell, whispered testimonial",
                "scene3": f"See the difference {product_name} makes in real lives",
                "visual3": "Transformation stories, tears to smiles, connections made",
                "sound3": "Full orchestra emotional peak, authentic reactions",
                "scene4": f"{product_name}. Because {target_audience} deserve to feel understood.",
                "visual4": "Soft logo reveal, heartfelt tagline, community imagery",
                "sound4": "Emotional resolution, hopeful final notes, silence"
            },
            "Humorous": {
                "scene1": f"Breaking: {target_audience} discovered doing things the hard way. Again.",
                "visual1": "Comically exaggerated struggles, Rube Goldberg-style complications",
                "sound1": "Circus music, cartoon sound effects, record scratches",
                "scene2": f"There's {product_name}. {key_message} (Duh.)",
                "visual2": "Product appears, everyone facepalms at obvious solution",
                "sound2": "Sitcom 'aha' music, collective 'ohhh', laugh track",
                "scene3": f"Now {target_audience} have time for important things. Like lunch.",
                "visual3": "Montage of people doing hilariously mundane activities joyfully",
                "sound3": "Happy-go-lucky tune, eating sounds, satisfied sighs",
                "scene4": f"{product_name}. It's so simple, it's stupid. In a good way.",
                "visual4": "Logo with wink animation, URL with Comic Sans disclaimer",
                "sound4": "Punchline drum hit, giggle, product jingle"
            },
            "Dramatic": {
                "scene1": f"The clock strikes midnight. {target_audience} face their greatest challenge.",
                "visual1": "Noir lighting, rain on windows, intense close-ups, ticking clock",
                "sound1": "Ominous orchestral opening, thunder, clock ticking intensifies",
                "scene2": f"One choice changes everything. {product_name}. {key_message}",
                "visual2": "Dramatic product reveal, lightning flash, hero shot angle",
                "sound2": "Orchestra hits climax, silence, then powerful resumption",
                "scene3": f"Witness the transformation. {target_audience} rise victorious.",
                "visual3": "Epic montage of success, obstacles overcome, triumphant moments",
                "sound3": "Battle music, victory sounds, crowd roar building",
                "scene4": f"{product_name}. When failure is not an option.",
                "visual4": "Logo strikes like lightning, epic final frame, cinematic finish",
                "sound4": "Massive orchestral finale, impact sound, echoing resolution"
            },
            "Inspirational": {
                "scene1": f"Every {target_audience} has a dream. What's stopping you?",
                "visual1": "Sunrise shots, people looking at horizons, dreams visualized",
                "sound1": "Inspiring piano intro, wind sounds, aspirational ambience",
                "scene2": f"{product_name} believes in your potential. {key_message}",
                "visual2": "Product enabling dreams, barriers breaking, possibilities opening",
                "sound2": "Orchestra joins piano, breakthrough sounds, hope rising",
                "scene3": f"Join thousands of {target_audience} already living their dreams",
                "visual3": "Success montage, achievements unlocked, joy and fulfillment",
                "sound3": "Full inspirational orchestra, cheers, achievement sounds",
                "scene4": f"{product_name}. Your dream. Our mission. Let's begin.",
                "visual4": "Aspirational logo treatment, call to action, unlimited sky",
                "sound4": "Triumphant finale, eagle cry, infinite possibility"
            }
        }
        
        # Get the template for the mood, or default to Professional
        template = mood_templates.get(mood, mood_templates["Professional"])
        
        return [
            {
                "number": 1,
                "duration": 7.5,
                "script": template["scene1"],
                "videoPrompt": template["visual1"],
                "sfxPrompt": template["sound1"]
            },
            {
                "number": 2,
                "duration": 7.5,
                "script": template["scene2"],
                "videoPrompt": template["visual2"],
                "sfxPrompt": template["sound2"]
            },
            {
                "number": 3,
                "duration": 7.5,
                "script": template["scene3"],
                "videoPrompt": template["visual3"],
                "sfxPrompt": template["sound3"]
            },
            {
                "number": 4,
                "duration": 7.5,
                "script": template["scene4"],
                "videoPrompt": template["visual4"],
                "sfxPrompt": template["sound4"]
            }
        ]
    
    async def enhance_product_idea(self, idea: str, mood: str, audience: str) -> str:
        """Transform a rough idea into a concrete, compelling product concept using Gemini AI"""
        
        prompt = f"""
        You are a world-class product marketing expert. Transform this rough idea into a concrete, compelling product concept:
        
        Rough idea: {idea}
        Target audience: {audience}
        Desired mood/tone: {mood}
        
        Create a SPECIFIC and CONCRETE product concept that includes:
        
        1. What EXACTLY the product does (not vague - be specific!)
        2. The PRIMARY problem it solves for {audience}
        3. 2-3 UNIQUE features that make it stand out
        4. A clear VALUE PROPOSITION that resonates with {audience}
        5. Why it fits the {mood.lower()} tone
        
        Important guidelines:
        - If the original idea is vague (like "something for productivity"), create a SPECIFIC product concept
        - Include concrete details like how it works, what it looks like, or how people use it
        - Make it sound like a real product that could launch tomorrow
        - Keep it to 2-3 impactful sentences that paint a clear picture
        - Use language that appeals to {audience} and matches the {mood.lower()} tone
        
        Examples of transformations:
        - "Something for fitness" → "FitPulse AI: A smart wristband that uses advanced biometrics to create personalized micro-workouts throughout your day, perfect for busy professionals who struggle to find gym time."
        - "Help people sleep" → "DreamWave: An intelligent sleep system that combines adaptive sound therapy, temperature control, and circadian light adjustment to guarantee deep sleep within 12 minutes."
        
        Now transform the idea into something equally specific and compelling:
        """
        
        try:
            response = self.model.generate_content(prompt)
            enhanced_idea = response.text.strip()
            
            # Clean up any quotes if present
            enhanced_idea = enhanced_idea.strip('"').strip("'")
            
            # Ensure it's not too long
            sentences = enhanced_idea.split('. ')
            if len(sentences) > 3:
                # Take the most important sentences
                enhanced_idea = '. '.join(sentences[:3]) + '.'
            
            return enhanced_idea
            
        except Exception as e:
            print(f"Error enhancing idea with Gemini: {e}")
            print(f"Error type: {type(e).__name__}")
            print(f"API Key present: {bool(os.getenv('GOOGLE_API_KEY'))}")
            
            # Check specific error types
            error_msg = str(e)
            if "API_KEY_INVALID" in error_msg:
                print("❌ INVALID API KEY - Get a new one from https://makersuite.google.com/app/apikey")
            elif "quota" in error_msg.lower():
                print("❌ QUOTA EXCEEDED - You've hit the free tier limit")
            elif "403" in error_msg:
                print("❌ API ACCESS DENIED - Check if Gemini API is enabled")
            
            # Return a more specific fallback
            if "productivity" in idea.lower():
                return f"TaskFlow Pro: An AI-powered productivity suite that learns your work patterns and automatically schedules deep focus time, manages interruptions, and prioritizes tasks based on your energy levels - designed for {audience} who want a {mood.lower()} approach to getting more done."
            elif "health" in idea.lower() or "fitness" in idea.lower():
                return f"VitalityTrack: A comprehensive health monitoring system that uses advanced sensors to track vital signs, predict health issues, and provide personalized wellness recommendations - perfect for {audience} seeking a {mood.lower()} solution to proactive health management."
            elif "finance" in idea.lower() or "money" in idea.lower():
                return f"WealthWise AI: An intelligent financial advisor that analyzes spending patterns, automates savings, and provides personalized investment strategies - ideal for {audience} who want a {mood.lower()} approach to building wealth."
            else:
                return f"InnovatePro: A revolutionary solution that transforms how {audience} approach their daily challenges, combining cutting-edge technology with a {mood.lower()} user experience to deliver unprecedented results and efficiency."
    
    async def generate_social_posts(self, product_name: str, target_audience: str, key_message: str) -> Dict[str, str]:
        """Generate social media posts using Gemini"""
        
        prompt = f"""
        Create engaging social media posts for Twitter and LinkedIn to promote a new commercial for:
        
        Product Name: {product_name}
        Target Audience: {target_audience}
        Key Message: {key_message}
        
        Create:
        1. A Twitter post (280 characters max) with hashtags and emoji
        2. A LinkedIn post (longer form, professional tone) with benefits and call to action
        
        Both posts should mention watching the new commercial and include a special offer.
        
        Format as JSON:
        {{
            "twitter": "Your Twitter post here",
            "linkedin": "Your LinkedIn post here"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                posts = json.loads(json_str)
                return posts
            else:
                return self._generate_fallback_social_posts(product_name, target_audience, key_message)
                
        except Exception as e:
            print(f"Error generating social posts: {e}")
            return self._generate_fallback_social_posts(product_name, target_audience, key_message)
    
    def _generate_fallback_social_posts(self, product_name: str, target_audience: str, key_message: str) -> Dict[str, str]:
        """Fallback social posts if API fails"""
        return {
            "twitter": f"🚀 Introducing {product_name}! {key_message}\n\nPerfect for {target_audience}. Watch our new commercial & get 20% off!\n\n#Innovation #{product_name.replace(' ', '')}",
            "linkedin": f"Excited to announce {product_name}!\n\n{key_message}\n\nDesigned specifically for {target_audience}, our solution delivers real results.\n\nWatch our new commercial to see the transformation in action. Limited time: 20% off for early adopters.\n\n#Innovation #BusinessGrowth"
        }
