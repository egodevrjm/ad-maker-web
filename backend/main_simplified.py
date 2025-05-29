"""
Simplified Ad Maker Backend - Clean and minimal with better error handling
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, List
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI with custom error handlers
app = FastAPI(
    title="Ad Maker Wizard API - Simplified",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],  # Be more permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import services - with fallbacks
try:
    from services.gemini_service_v2 import GeminiServiceV2
    gemini_service = GeminiServiceV2()
    logger.info("✅ Gemini service initialized")
except Exception as e:
    logger.error(f"❌ Failed to initialize Gemini service: {e}")
    gemini_service = None

# Pydantic models
class EnhanceIdeaRequest(BaseModel):
    idea: str
    mood: str = "Professional"
    audience: str = "General audience"

class GenerateScriptRequest(BaseModel):
    productName: str
    targetAudience: str
    keyMessage: str
    mood: Optional[str] = "Professional"
    productIdea: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    suggestion: Optional[str] = None

# Custom exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "suggestion": "Please check the server logs or try again later"
        }
    )

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Ad Maker Wizard API v2.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "enhance_idea": "/api/enhance-product-idea",
            "generate_script": "/api/generate-script"
        }
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    services_status = {
        "api": "healthy",
        "gemini": "healthy" if gemini_service else "unavailable",
        "environment": {
            "GOOGLE_API_KEY": "set" if os.getenv("GOOGLE_API_KEY") else "missing",
            "FAL_API_KEY": "set" if os.getenv("FAL_API_KEY") else "missing",
            "ELEVENLABS_API_KEY": "set" if os.getenv("ELEVENLABS_API_KEY") else "missing"
        }
    }
    
    overall_health = all([
        services_status["gemini"] == "healthy",
        services_status["environment"]["GOOGLE_API_KEY"] == "set"
    ])
    
    return {
        "status": "healthy" if overall_health else "degraded",
        "services": services_status
    }

# Enhance Product Idea endpoint
@app.post("/api/enhance-product-idea")
async def enhance_product_idea(request: EnhanceIdeaRequest):
    """Enhance product idea using AI"""
    
    if not gemini_service:
        logger.error("Gemini service not available")
        return JSONResponse(
            status_code=503,
            content={
                "error": "AI service unavailable",
                "detail": "Gemini service is not initialized",
                "suggestion": "Check if GOOGLE_API_KEY is set in .env file"
            }
        )
    
    try:
        enhanced_idea = await gemini_service.enhance_product_idea(
            request.idea,
            request.mood,
            request.audience
        )
        
        return {"enhancedIdea": enhanced_idea}
        
    except Exception as e:
        logger.error(f"Error enhancing idea: {e}")
        # Return a graceful fallback
        fallback = f"{request.idea} - Tailored for {request.audience} with a {request.mood.lower()} approach."
        return {
            "enhancedIdea": fallback,
            "warning": "Using fallback enhancement due to API error"
        }

# Generate Script endpoint
@app.post("/api/generate-script")
async def generate_script(request: GenerateScriptRequest):
    """Generate commercial script"""
    
    if not gemini_service:
        logger.error("Gemini service not available")
        # Return mock data for development
        return {
            "scenes": _get_mock_scenes(request.productName, request.targetAudience),
            "warning": "Using mock data - Gemini service unavailable"
        }
    
    try:
        scenes = await gemini_service.generate_script(
            request.productName,
            request.targetAudience,
            request.keyMessage,
            request.mood
        )
        
        return {"scenes": scenes}
        
    except Exception as e:
        logger.error(f"Error generating script: {e}")
        # Return fallback scenes
        return {
            "scenes": _get_mock_scenes(request.productName, request.targetAudience),
            "warning": "Using fallback script due to API error"
        }

# Mock data generators for development/fallback
def _get_mock_scenes(product_name: str, target_audience: str) -> List[Dict]:
    """Generate mock scenes for development"""
    return [
        {
            "number": 1,
            "duration": 7.5,
            "script": f"Introducing the challenge {target_audience} face every day...",
            "videoPrompt": "Opening scene with relatable situation",
            "sfxPrompt": "Ambient music building tension"
        },
        {
            "number": 2,
            "duration": 7.5,
            "script": f"That's why we created {product_name} - your solution is here.",
            "videoPrompt": "Product reveal with key features",
            "sfxPrompt": "Uplifting music transition"
        },
        {
            "number": 3,
            "duration": 7.5,
            "script": f"See how {product_name} transforms everything...",
            "videoPrompt": "Customer success stories and benefits",
            "sfxPrompt": "Inspirational background music"
        },
        {
            "number": 4,
            "duration": 7.5,
            "script": f"Join the revolution. {product_name} - Start today!",
            "videoPrompt": "Call to action with website and offer",
            "sfxPrompt": "Memorable closing jingle"
        }
    ]

# Simplified endpoints for other services (returning mock data)
@app.get("/api/voices")
async def list_voices():
    """Return mock voices for development"""
    return {
        "voices": [
            {"id": "voice1", "name": "Sarah", "description": "Warm, friendly female voice"},
            {"id": "voice2", "name": "James", "description": "Professional male voice"},
            {"id": "voice3", "name": "Emma", "description": "Energetic female voice"},
            {"id": "voice4", "name": "Michael", "description": "Authoritative male voice"}
        ]
    }

@app.post("/api/generate-video")
async def generate_video(data: Dict):
    """Mock video generation"""
    scene_number = data.get("sceneNumber", 1)
    return {
        "sceneNumber": scene_number,
        "videoUrl": f"/api/mock-video/{scene_number}.mp4",
        "status": "mock"
    }

@app.post("/api/generate-sfx")
async def generate_sfx(data: Dict):
    """Mock sound effects"""
    return {
        "soundEffects": [
            {"id": f"sfx{i}", "url": f"/api/mock-sfx/{i}.mp3", "name": f"Option {i}"}
            for i in range(1, 5)
        ]
    }

@app.post("/api/generate-voiceover")
async def generate_voiceover(data: Dict):
    """Mock voiceover"""
    return {
        "audioUrl": "/api/mock-voiceover/final.mp3",
        "duration": 30,
        "voiceUsed": data.get("voiceName", "Default Voice")
    }

# Error handling for 404s
@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(path_name: str):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "path": f"/{path_name}",
            "suggestion": "Check /docs for available endpoints"
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    # Check for required environment variables
    if not os.getenv("GOOGLE_API_KEY"):
        logger.warning("⚠️  GOOGLE_API_KEY not found in environment")
    
    logger.info("Starting Ad Maker Wizard API v2.0...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
