import os
import uuid
from typing import Dict, Optional
import asyncio
from pathlib import Path
import requests
from dotenv import load_dotenv
import json

load_dotenv()

# Try to import FAL with different methods
fal = None
fal_method = None

try:
    import fal_client
    fal = fal_client
    fal_method = "fal_client"
    print(f"✅ Using fal_client import")
except ImportError:
    print("❌ WARNING: Could not import FAL client. Install with: pip install fal-client")

class FalService:
    def __init__(self):
        self.api_key = os.getenv('FAL_API_KEY')
        
        if not self.api_key:
            print("WARNING: FAL_API_KEY not found in environment variables")
        elif not fal:
            print("WARNING: FAL client not available - install with: pip install fal-client")
        else:
            # Set API key in environment (some versions need this)
            os.environ["FAL_KEY"] = self.api_key
            
            # Try to configure FAL based on import method
            try:
                if hasattr(fal, 'config'):
                    if hasattr(fal.config, 'credentials'):
                        fal.config.credentials = self.api_key
                        print("✅ FAL API key configured via config.credentials")
                    else:
                        print("⚠️  fal.config exists but no credentials attribute")
                elif hasattr(fal, 'configure'):
                    fal.configure(api_key=self.api_key)
                    print("✅ FAL API key configured via configure()")
                else:
                    print("⚠️  Using FAL_KEY environment variable")
            except Exception as e:
                print(f"⚠️  Could not configure FAL directly: {e}")
            
        self.output_dir = Path("outputs/videos")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Track ongoing requests
        self.ongoing_requests = {}
    
    async def generate_video(self, prompt: Optional[str], scene_number: int, duration: float = 7.5) -> Dict:
        """Generate video using FAL.ai Veo2"""
        
        print(f"\n=== FAL Service: Generating video for scene {scene_number} ===")
        print(f"Prompt: '{prompt}'")
        print(f"FAL method: {fal_method}")
        
        # Check for duplicate requests
        request_key = f"scene_{scene_number}"
        if request_key in self.ongoing_requests:
            print(f"Request for scene {scene_number} already in progress, waiting...")
            return await self.ongoing_requests[request_key]
        
        # Create a future for this request
        future = asyncio.Future()
        self.ongoing_requests[request_key] = future
        
        try:
            # Validate inputs
            if not prompt or prompt.strip() == "":
                raise ValueError(f"Prompt cannot be empty. Received: '{prompt}'")
            
            if not self.api_key:
                raise ValueError("FAL_API_KEY not configured")
            
            if not fal:
                raise ImportError("FAL client not available. Install with: pip install fal-client")
            
            cleaned_prompt = prompt.strip()
            print(f"Using prompt: {cleaned_prompt[:100]}...")
            
            print("Calling FAL API...")
            
            # Python FAL client uses different API than JavaScript
            # Use subscribe method for Python
            def run_fal():
                # Re-set the API key in case it's needed
                os.environ["FAL_KEY"] = self.api_key
                
                # Python fal_client.subscribe expects input directly, not wrapped
                result = fal.subscribe(
                    "fal-ai/veo2",
                    input={
                        "prompt": cleaned_prompt
                    }
                )
                return result
            
            result = await asyncio.to_thread(run_fal)
            
            print(f"FAL Response received")
            print(f"Result type: {type(result)}")
            
            # Try to extract video URL from various response formats
            video_url = None
            
            # If result is a string URL directly
            if isinstance(result, str) and result.startswith('http'):
                video_url = result
            
            # If result has attributes
            elif hasattr(result, '__dict__'):
                print(f"Result attributes: {result.__dict__.keys()}")
                
                # Try result.data
                if hasattr(result, 'data'):
                    data = result.data
                    if isinstance(data, dict):
                        if 'video' in data and isinstance(data['video'], dict):
                            video_url = data['video'].get('url')
                        elif 'video_url' in data:
                            video_url = data['video_url']
                        elif 'url' in data:
                            video_url = data['url']
                    elif isinstance(data, str) and data.startswith('http'):
                        video_url = data
                
                # Try direct attributes
                if not video_url and hasattr(result, 'video'):
                    if isinstance(result.video, dict):
                        video_url = result.video.get('url')
                    elif isinstance(result.video, str):
                        video_url = result.video
                        
                if not video_url and hasattr(result, 'url'):
                    video_url = result.url
                    
                if not video_url and hasattr(result, 'video_url'):
                    video_url = result.video_url
            
            # If result is a dict
            elif isinstance(result, dict):
                print(f"Result keys: {result.keys()}")
                
                # Try various key patterns
                if 'video' in result and isinstance(result['video'], dict):
                    video_url = result['video'].get('url')
                elif 'video_url' in result:
                    video_url = result['video_url']
                elif 'url' in result:
                    video_url = result['url']
                elif 'output' in result:
                    output = result['output']
                    if isinstance(output, dict):
                        video_url = output.get('video_url') or output.get('url')
                    elif isinstance(output, str):
                        video_url = output
                elif 'data' in result:
                    data = result['data']
                    if isinstance(data, dict) and 'video' in data:
                        video_url = data['video'].get('url') if isinstance(data['video'], dict) else data['video']
            
            if not video_url:
                print(f"Could not find video URL in response")
                print(f"Full result: {result}")
                raise Exception("No video URL found in FAL response")
            
            print(f"Found video URL: {video_url}")
            
            # Download the video
            video_id = str(uuid.uuid4())
            video_path = self.output_dir / f"{video_id}.mp4"
            
            print(f"Downloading video...")
            response = requests.get(video_url, stream=True, timeout=120)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(video_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            progress = (downloaded / total_size) * 100
                            print(f"\rDownloading: {progress:.1f}%", end='', flush=True)
            
            print(f"\nVideo saved to: {video_path}")
            
            result_data = {
                "sceneNumber": scene_number,
                "videoUrl": f"/api/videos/{video_id}.mp4",
                "videoPath": str(video_path),
                "thumbnail": f"/api/thumbnails/{video_id}.jpg"
            }
            
            future.set_result(result_data)
            return result_data
            
        except Exception as e:
            print(f"\n!!! Error in FAL service: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            
            # Return placeholder
            placeholder_result = {
                "sceneNumber": scene_number,
                "videoUrl": f"/api/placeholder-video/{scene_number}",
                "videoPath": None,
                "thumbnail": f"/api/placeholder-thumbnail/{scene_number}",
                "error": str(e)
            }
            future.set_result(placeholder_result)
            return placeholder_result
            
        finally:
            # Clean up the ongoing request
            if request_key in self.ongoing_requests:
                del self.ongoing_requests[request_key]
            print(f"=== Completed scene {scene_number} ===\n")
    
    async def generate_video_alternative(self, prompt: str, scene_number: int, duration: float = 7.5) -> Dict:
        """Alternative video generation - not used anymore"""
        return {
            "sceneNumber": scene_number,
            "videoUrl": f"/api/placeholder-video/{scene_number}",
            "videoPath": None,
            "thumbnail": f"/api/placeholder-thumbnail/{scene_number}",
            "error": "Alternative generation not implemented"
        }
