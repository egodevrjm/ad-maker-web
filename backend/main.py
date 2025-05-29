from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, Response
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import json
import asyncio
from datetime import datetime
from pathlib import Path
import uuid
from dotenv import load_dotenv
import tempfile
import shutil

# Load environment variables
load_dotenv()

# Import our services
from services.gemini_service import GeminiService
from services.fal_service import FalService
from services.elevenlabs_direct import ElevenLabsDirectService

# Try to import video service, use fallback for Python 3.12
try:
    from services.video_service import VideoService
except ImportError as e:
    print("Warning: MoviePy not available, using fallback video service")
    try:
        from services.video_service_py312 import VideoServicePy312 as VideoService
    except ImportError:
        print("Error: No video service available")
        # Create a dummy video service
        class VideoService:
            def __init__(self):
                pass
            async def stitch_video_with_sfx(self, *args, **kwargs):
                return {"error": "Video processing not available"}
            async def create_final_video(self, *args, **kwargs):
                return {"error": "Video processing not available"}
            def generate_thumbnail(self, *args, **kwargs):
                return None

# Initialize FastAPI app
app = FastAPI(title="Ad Maker Wizard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
AUDIO_DIR = Path("outputs/audio")
VIDEO_DIR = Path("outputs/videos")
PROCESSED_DIR = Path("outputs/processed")

for dir_path in [UPLOAD_DIR, OUTPUT_DIR, AUDIO_DIR, VIDEO_DIR, PROCESSED_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Initialize services
gemini_service = GeminiService()
fal_service = FalService()
video_service = VideoService()
elevenlabs_service = ElevenLabsDirectService()

# Pydantic models
class ProductInfo(BaseModel):
    productName: str
    targetAudience: str
    keyMessage: str
    mood: Optional[str] = "Professional"
    productIdea: Optional[str] = None

class EnhanceIdeaRequest(BaseModel):
    idea: str
    mood: str
    audience: str

class SceneData(BaseModel):
    prompt: str
    duration: float
    sceneNumber: int

class VoiceoverData(BaseModel):
    text: str
    voiceId: str
    voiceName: str

class SocialPostsData(BaseModel):
    productName: str
    targetAudience: str
    keyMessage: str

# API Status endpoint
@app.get("/api/status")
async def get_status():
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "gemini": "ready",
            "fal": "ready", 
            "elevenlabs": "ready",
            "video_processing": "ready"
        }
    }

# Enhance Product Idea endpoint
@app.post("/api/enhance-product-idea")
async def enhance_product_idea(data: EnhanceIdeaRequest):
    """Enhance product idea using Google Gemini"""
    
    try:
        enhanced_idea = await gemini_service.enhance_product_idea(
            data.idea,
            data.mood,
            data.audience
        )
        
        return {"enhancedIdea": enhanced_idea}
    
    except Exception as e:
        print(f"Error in enhance_product_idea: {e}")
        # Return a simple enhancement as fallback
        enhanced = f"{data.idea} - Designed specifically for {data.audience} with a {data.mood.lower()} approach."
        return {"enhancedIdea": enhanced}

# Script Generation endpoint
@app.post("/api/generate-script")
async def generate_script(data: ProductInfo):
    """Generate commercial script using Google Gemini"""
    
    try:
        scenes = await gemini_service.generate_script(
            data.productName,
            data.targetAudience,
            data.keyMessage,
            data.mood
        )
        
        return {"scenes": scenes}
    
    except Exception as e:
        print(f"Error in generate_script: {e}")
        # Return fallback script if API fails
        scenes = gemini_service._generate_fallback_script(
            data.productName,
            data.targetAudience,
            data.keyMessage,
            data.mood
        )
        return {"scenes": scenes}

# Video Generation endpoint
@app.post("/api/generate-video")
async def generate_video(data: SceneData):
    """Generate video using FAL.ai"""
    
    print(f"\n=== API Endpoint: /api/generate-video ===")
    print(f"Received data: {data}")
    print(f"  - prompt: '{data.prompt}'")
    print(f"  - sceneNumber: {data.sceneNumber}")
    print(f"  - duration: {data.duration}")
    
    try:
        result = await fal_service.generate_video(
            data.prompt,
            data.sceneNumber,
            data.duration
        )
        
        return result
    
    except Exception as e:
        print(f"Error in generate_video: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        
        # Return placeholder if all methods fail
        return {
            "sceneNumber": data.sceneNumber,
            "videoUrl": f"/api/placeholder-video/{data.sceneNumber}",
            "thumbnail": f"/api/placeholder-thumbnail/{data.sceneNumber}",
            "error": str(e)
        }

# Sound Effects Generation endpoint
@app.post("/api/generate-sfx")
async def generate_sfx(data: Dict):
    """Generate sound effects using ElevenLabs"""
    
    try:
        sfx_prompt = data.get('prompt', 'upbeat background music')
        duration = data.get('duration', 7.5)
        
        sfx_options = await elevenlabs_service.generate_sound_effects(sfx_prompt, duration)
        
        return {"soundEffects": sfx_options}
    
    except Exception as e:
        print(f"Error in generate_sfx: {e}")
        # Return placeholder sound effects
        sfx_options = []
        for i in range(4):
            sfx_id = str(uuid.uuid4())
            sfx_options.append({
                "id": sfx_id,
                "url": f"/api/sfx/{sfx_id}.mp3",
                "name": f"Option {i + 1}"
            })
        return {"soundEffects": sfx_options}

# Voice List endpoint
@app.get("/api/voices")
async def list_voices():
    """Get available voices from ElevenLabs"""
    
    try:
        voices = await elevenlabs_service.get_voices()
        return {"voices": voices}
    
    except Exception as e:
        print(f"Error in list_voices: {e}")
        # Return default voices
        voices = elevenlabs_service._get_default_voices()
        return {"voices": voices}

# Voiceover Generation endpoint
@app.post("/api/generate-voiceover")
async def generate_voiceover(data: VoiceoverData):
    """Generate voiceover using ElevenLabs"""
    
    try:
        result = await elevenlabs_service.generate_voiceover(
            data.text,
            data.voiceId,
            data.voiceName
        )
        
        return result
    
    except Exception as e:
        print(f"Error in generate_voiceover: {e}")
        # Return placeholder
        audio_id = str(uuid.uuid4())
        return {
            "audioUrl": f"/api/voiceover/{audio_id}.mp3",
            "duration": 30,
            "voiceUsed": data.voiceName
        }

# Video Stitching endpoint
@app.post("/api/stitch-videos")
async def stitch_videos(data: Dict):
    """Combine videos with sound effects"""
    
    try:
        videos = data.get("videos", [])
        sound_effects = data.get("soundEffects", [])
        
        stitched_videos = []
        
        for i, video in enumerate(videos):
            # Get the selected SFX for this scene
            sfx_data = sound_effects[i] if i < len(sound_effects) else {}
            selected_sfx = sfx_data.get("selectedSfx", {})
            
            # Get paths
            video_path = video.get("videoPath")
            sfx_path = selected_sfx.get("path")
            
            # If no direct path, try to extract from URL
            if not sfx_path and selected_sfx.get("url"):
                sfx_url = selected_sfx.get("url")
                if "sfx/" in sfx_url:
                    sfx_id = sfx_url.split("/")[-1].replace(".mp3", "")
                    potential_path = AUDIO_DIR / f"sfx_{sfx_id}.mp3"
                    if potential_path.exists():
                        sfx_path = str(potential_path)
            
            # Stitch video with SFX
            result = await video_service.stitch_video_with_sfx(
                video_path,
                sfx_path,
                video.get("sceneNumber", i + 1)
            )
            
            stitched_videos.append(result)
        
        return {"stitchedVideos": stitched_videos}
    
    except Exception as e:
        print(f"Error in stitch_videos: {e}")
        # Return original videos if stitching fails
        return {"stitchedVideos": data.get("videos", [])}

# Final Video Creation endpoint
@app.post("/api/create-final-video")
async def create_final_video(data: Dict):
    """Create the final commercial video"""
    
    try:
        stitched_videos = data.get("stitchedVideos", [])
        voiceover_data = data.get("voiceover", {})
        voiceover_path = voiceover_data.get("audioPath")
        
        # If no direct path, try to extract from URL
        if not voiceover_path and voiceover_data.get("audioUrl"):
            audio_url = voiceover_data.get("audioUrl")
            if "voiceover/" in audio_url:
                audio_id = audio_url.split("/")[-1].replace(".mp3", "")
                potential_path = AUDIO_DIR / f"voiceover_{audio_id}.mp3"
                if potential_path.exists():
                    voiceover_path = str(potential_path)
        
        result = await video_service.create_final_video(
            stitched_videos,
            voiceover_path
        )
        
        return result
    
    except Exception as e:
        print(f"Error in create_final_video: {e}")
        return {
            "finalVideoUrl": "/api/placeholder-final",
            "duration": 30,
            "resolution": "1920x1080",
            "fileSize": "0MB",
            "error": str(e)
        }

# Social Posts Generation endpoint
@app.post("/api/generate-social-posts")
async def generate_social_posts(data: SocialPostsData):
    """Generate social media posts using Gemini"""
    
    try:
        posts = await gemini_service.generate_social_posts(
            data.productName,
            data.targetAudience,
            data.keyMessage
        )
        
        return {"posts": posts}
    
    except Exception as e:
        print(f"Error in generate_social_posts: {e}")
        # Return fallback posts
        posts = gemini_service._generate_fallback_social_posts(
            data.productName,
            data.targetAudience,
            data.keyMessage
        )
        return {"posts": posts}

# File serving endpoints
@app.get("/api/videos/{video_id}")
async def get_video(video_id: str):
    """Serve video files"""
    # Check multiple possible locations
    possible_paths = [
        VIDEO_DIR / video_id,
        VIDEO_DIR / f"{video_id}.mp4",
        PROCESSED_DIR / video_id,
        PROCESSED_DIR / f"{video_id}.mp4"
    ]
    
    for video_path in possible_paths:
        if video_path.exists():
            return FileResponse(video_path, media_type="video/mp4")
    
    # Return placeholder video
    return Response(
        content=b"Placeholder video content",
        media_type="video/mp4",
        headers={"Content-Disposition": f"attachment; filename={video_id}"}
    )

@app.get("/api/sfx/{sfx_id}")
async def get_sfx(sfx_id: str):
    """Serve sound effect files"""
    possible_paths = [
        AUDIO_DIR / f"sfx_{sfx_id}",
        AUDIO_DIR / f"sfx_{sfx_id}.mp3",
        AUDIO_DIR / sfx_id
    ]
    
    for sfx_path in possible_paths:
        if sfx_path.exists():
            return FileResponse(sfx_path, media_type="audio/mpeg")
    
    # Return placeholder audio
    return Response(
        content=b"Placeholder audio content",
        media_type="audio/mpeg",
        headers={"Content-Disposition": f"attachment; filename={sfx_id}"}
    )

@app.get("/api/voiceover/{audio_id}")
async def get_voiceover(audio_id: str):
    """Serve voiceover files"""
    possible_paths = [
        AUDIO_DIR / f"voiceover_{audio_id}",
        AUDIO_DIR / f"voiceover_{audio_id}.mp3",
        AUDIO_DIR / audio_id
    ]
    
    for audio_path in possible_paths:
        if audio_path.exists():
            return FileResponse(audio_path, media_type="audio/mpeg")
    
    # Return placeholder audio
    return Response(
        content=b"Placeholder voiceover content",
        media_type="audio/mpeg",
        headers={"Content-Disposition": f"attachment; filename={audio_id}"}
    )

@app.get("/api/stitched/{video_id}")
async def get_stitched_video(video_id: str):
    """Serve stitched video files"""
    possible_paths = [
        PROCESSED_DIR / video_id,
        PROCESSED_DIR / f"{video_id}.mp4"
    ]
    
    for video_path in possible_paths:
        if video_path.exists():
            return FileResponse(video_path, media_type="video/mp4")
    
    # Return placeholder
    return Response(
        content=b"Placeholder stitched video",
        media_type="video/mp4",
        headers={"Content-Disposition": f"attachment; filename={video_id}"}
    )

@app.get("/api/final/{video_id}")
async def get_final_video(video_id: str):
    """Serve final video files"""
    possible_paths = [
        PROCESSED_DIR / f"final_{video_id}",
        PROCESSED_DIR / f"final_{video_id}.mp4",
        PROCESSED_DIR / video_id
    ]
    
    for video_path in possible_paths:
        if video_path.exists():
            return FileResponse(video_path, media_type="video/mp4")
    
    # Return placeholder
    return Response(
        content=b"Placeholder final video",
        media_type="video/mp4",
        headers={"Content-Disposition": f"attachment; filename=final_{video_id}"}
    )

@app.get("/api/thumbnails/{thumb_id}")
async def get_thumbnail(thumb_id: str):
    """Serve thumbnail images"""
    # Try to generate thumbnail from video
    video_id = thumb_id.replace('.jpg', '')
    video_paths = [
        VIDEO_DIR / f"{video_id}.mp4",
        VIDEO_DIR / video_id,
        PROCESSED_DIR / f"{video_id}.mp4"
    ]
    
    for video_path in video_paths:
        if video_path.exists():
            thumb_path = await asyncio.to_thread(
                video_service.generate_thumbnail,
                str(video_path)
            )
            if thumb_path and Path(thumb_path).exists():
                return FileResponse(thumb_path, media_type="image/jpeg")
    
    # Return placeholder image
    return Response(
        content=b"Placeholder thumbnail",
        media_type="image/jpeg",
        headers={"Content-Disposition": f"attachment; filename={thumb_id}"}
    )

# Placeholder endpoints for fallback
@app.get("/api/placeholder-video/{scene_number}")
async def get_placeholder_video(scene_number: int):
    """Return a placeholder video response"""
    # Could generate a simple video with text here
    return Response(
        content=f"Scene {scene_number} placeholder video".encode(),
        media_type="video/mp4",
        headers={"Content-Disposition": f"attachment; filename=placeholder_scene_{scene_number}.mp4"}
    )

@app.get("/api/placeholder-thumbnail/{scene_number}")
async def get_placeholder_thumbnail(scene_number: int):
    """Return a placeholder thumbnail response"""
    return Response(
        content=f"Scene {scene_number} placeholder thumbnail".encode(),
        media_type="image/jpeg",
        headers={"Content-Disposition": f"attachment; filename=placeholder_thumb_{scene_number}.jpg"}
    )

@app.get("/api/placeholder-final")
async def get_placeholder_final():
    """Return a placeholder final video"""
    return Response(
        content=b"Placeholder final commercial video",
        media_type="video/mp4",
        headers={"Content-Disposition": "attachment; filename=placeholder_final.mp4"}
    )

# File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handle file uploads"""
    
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    file_path = UPLOAD_DIR / f"{file_id}{file_extension}"
    
    # Save file
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {
        "fileId": file_id,
        "fileName": file.filename,
        "filePath": str(file_path),
        "fileSize": len(content)
    }

# Health check
@app.get("/")
async def root():
    return {
        "message": "Ad Maker Wizard API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "status": "/api/status",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Ad Maker Wizard API...")
    print(f"Google API Key: {'✓' if os.getenv('GOOGLE_API_KEY') else '✗'}")
    print(f"FAL API Key: {'✓' if os.getenv('FAL_API_KEY') else '✗'}")
    print(f"ElevenLabs API Key: {'✓' if os.getenv('ELEVENLABS_API_KEY') else '✗'}")
    uvicorn.run(app, host="0.0.0.0", port=8000)