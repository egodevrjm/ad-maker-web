# 🚀 Ad Maker Web - Quick Reference

## Start the App
```bash
./start-app.sh
```
Then open http://localhost:3000

## What's Working

### ✅ Complete Pipeline
1. **Idea → Enhanced Product** (Google Gemini AI)
2. **Product → Script** (4 scenes, 30 seconds)
3. **Script → Videos** (Google Veo 2 via FAL.ai)
4. **Videos → Sound Effects** (ElevenLabs or mock)
5. **Videos + SFX → Stitched** (FFmpeg mixing)
6. **Script → Voiceover** (ElevenLabs TTS)
7. **All → Final Video** (FFmpeg concatenation)
8. **Video → Social Posts** (AI-generated)

### 🎯 Key Features
- **Auto-save**: Never lose progress
- **Resume**: Pick up where you left off
- **Video caching**: Reuse expensive operations
- **Voice preview**: Try before generating
- **Real processing**: Actual video/audio manipulation
- **Graceful fallbacks**: Works without dependencies

## Check Your Setup

### Backend Console Shows:
```
✅ GOOGLE_API_KEY: Set
✅ FAL_API_KEY: Set
✅ ELEVENLABS_API_KEY: Set
✅ FFmpeg: Installed
```

### Missing Something?
- **No FFmpeg?** → `brew install ffmpeg`
- **No API keys?** → App uses mock data
- **Errors?** → Check console logs

## File Locations
- **Videos**: `backend-node/outputs/videos/`
- **Voiceovers**: `backend-node/outputs/voiceovers/`
- **Final Videos**: `backend-node/outputs/final/`

## Test Commands
```bash
# Test voiceover
./test-voiceover-quick.sh

# Test video processing
./backend-node/test-video-processing.sh
```

## Tips
- Generate Script button appears when field is empty
- Click play icon to preview any voice
- Yellow badges = using mock data
- Green badges = using real AI
- Videos are cached for 7 days

## British English ✅
- All outputs use British spelling
- Metric measurements
- Optimized for 

---
**Ready to create amazing commercials!** 🎬
