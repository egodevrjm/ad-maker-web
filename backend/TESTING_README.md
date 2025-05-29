# Backend Testing Guide

## Quick Start

### Option 1: Start Backend Only (for testing)
```bash
python start_backend.py
```

### Option 2: Manual Start
```bash
# Activate virtual environment (if exists)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the server
python main.py
```

## Running Tests

**IMPORTANT:** The backend server must be running before running tests!

### In a separate terminal:
```bash
python test_api.py
```

## Test Suite Features

The test suite (`test_api.py`) will:
1. Check if the server is running (with helpful error if not)
2. Test API status endpoint
3. Test AI idea enhancement
4. Test script generation with mood
5. Test voice listing
6. Test video generation
7. Test sound effects generation
8. Test voiceover generation
9. Test social posts generation

## Common Issues

### "Connection refused" Error
This means the backend server isn't running. Start it first using one of the methods above.

### Missing Dependencies
```bash
pip install -r requirements.txt
```

### API Key Issues
Check that `.env` file has valid API keys:
- `GOOGLE_API_KEY`
- `FAL_API_KEY`
- `ELEVENLABS_API_KEY`

## API Endpoints

- **Status**: `GET /api/status`
- **Enhance Idea**: `POST /api/enhance-product-idea`
- **Generate Script**: `POST /api/generate-script`
- **List Voices**: `GET /api/voices`
- **Generate Video**: `POST /api/generate-video`
- **Generate SFX**: `POST /api/generate-sfx`
- **Generate Voiceover**: `POST /api/generate-voiceover`
- **API Docs**: `http://localhost:8000/docs`

## Testing Individual Endpoints

You can also test endpoints directly using curl:

```bash
# Test status
curl http://localhost:8000/api/status

# Test idea enhancement
curl -X POST http://localhost:8000/api/enhance-product-idea \
  -H "Content-Type: application/json" \
  -d '{"idea": "A smart water bottle", "mood": "Energetic", "audience": "Young Professionals"}'
```
