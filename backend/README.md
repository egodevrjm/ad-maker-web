# ElevenLabs MCP Integration Example

This backend now includes full API integration for:

1. **Google Gemini** - Script and social post generation
2. **FAL.ai** - AI video generation 
3. **ElevenLabs** - Sound effects and voiceover generation
4. **MoviePy** - Video processing and stitching

## Using the ElevenLabs MCP Tools

Since you have access to the ElevenLabs MCP tools, you can also use them directly from your terminal:

### Generate Sound Effects
```bash
# Example using the MCP tool directly
text_to_sound_effects --text "upbeat corporate music with tech vibes" --duration_seconds 7.5 --output_directory outputs/audio
```

### Generate Voiceover
```bash
# List available voices
search_voices

# Generate voiceover with a specific voice
text_to_speech --text "Your commercial script here" --voice_name "Rachel" --output_directory outputs/audio
```

### Alternative: Direct Integration

The backend now uses the ElevenLabs REST API directly via the `elevenlabs_direct.py` service. This provides:

- Sound effect generation with 4 variations per prompt
- Voice listing from ElevenLabs library
- Text-to-speech voiceover generation
- Automatic file management

## Running the Application

1. Make sure all dependencies are installed:
```bash
cd /Users//Code/ad-maker-web/backend
pip install -r requirements.txt
```

2. Start the backend server:
```bash
python main.py
```

3. The API will be available at http://localhost:8000

## API Endpoints

All endpoints now use real API integrations:

- `/api/generate-script` - Uses Google Gemini to create 4-scene scripts
- `/api/generate-video` - Uses FAL.ai to generate videos (tries Hunyuan, falls back to AnimateDiff)
- `/api/generate-sfx` - Uses ElevenLabs to create sound effects
- `/api/generate-voiceover` - Uses ElevenLabs for voice synthesis
- `/api/stitch-videos` - Uses MoviePy to combine video+audio
- `/api/create-final-video` - Uses MoviePy to create the final commercial

## Error Handling

The implementation includes comprehensive error handling:
- Fallback scripts if Gemini fails
- Alternative video generation methods
- Placeholder content for failed API calls
- Graceful degradation to ensure the app continues working

## File Management

Generated files are organized in:
- `outputs/videos/` - Generated video files
- `outputs/audio/` - Sound effects and voiceovers
- `outputs/processed/` - Stitched and final videos
- `uploads/` - User uploaded files

The file serving endpoints automatically check multiple locations and provide placeholders if files are missing.
