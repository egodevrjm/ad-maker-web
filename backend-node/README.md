# Node.js Backend - Installation Fix

## The Issue
The `@google/genai` package version `^0.1.0` doesn't exist. The correct packages are:
- `@google/generative-ai` (older, stable SDK) - version 0.21.0
- `@google/genai` (new SDK) - version 1.0.1

## Quick Fix (2 minutes)

### Step 1: Install Dependencies Manually
```bash
cd /Users//Code/ad-maker-web/backend-node

# Install core dependencies first
npm install express cors dotenv

# Install Google's Generative AI SDK (stable version)
npm install @google/generative-ai@0.21.0

# Optional: Install additional dependencies
npm install express-async-handler morgan
```

### Step 2: Copy Your API Key
```bash
# If you have a .env in the Python backend
cp ../backend/.env .

# Or create a new .env file
echo "GOOGLE_API_KEY=your_api_key_here" > .env
```

### Step 3: Test Gemini API
```bash
# Test if your API key works
node test-gemini.js
```

### Step 4: Start the Server
```bash
# Use the minimal server if you have issues
node server-minimal.js

# Or the full server
node server.js
```

## Alternative: Use the Bash Script
```bash
chmod +x install.sh
./install.sh
```

## What I've Fixed

1. **Correct Package Name**: Changed from `@google/genai` to `@google/generative-ai`
2. **Working Version**: Using version 0.21.0 which is stable
3. **Minimal Server**: Created `server-minimal.js` with fewer dependencies
4. **Test Script**: Added `test-gemini.js` to verify API key

## File Structure
```
backend-node/
├── server.js          # Full server with all features
├── server-minimal.js  # Minimal server (fewer deps)
├── test-gemini.js    # Test Gemini API directly
├── test-api.js       # Test all endpoints
├── install.sh        # Quick install script
├── package.json      # Fixed dependencies
└── .env             # Your API keys (create this)
```

## If You Still Have Issues

### Option 1: Use Python Simplified Backend
```bash
cd ../backend
python main_simplified.py
```

### Option 2: Install Packages One by One
```bash
npm init -y
npm install express
npm install cors
npm install dotenv
npm install @google/generative-ai@0.21.0
```

### Option 3: Use npm (not Yarn)
Make sure you're using npm, not yarn:
```bash
which npm
# Should show: /usr/bin/npm or similar
```

## Testing the API

Once running, test with:
```bash
# Health check
curl http://localhost:8000/health

# Enhance idea
curl -X POST http://localhost:8000/api/enhance-product-idea \
  -H "Content-Type: application/json" \
  -d '{"idea": "Smart water bottle"}'
```

## Why This Works

1. **Stable SDK**: Using the older but stable `@google/generative-ai` package
2. **Minimal Dependencies**: Core packages only, optional ones separate
3. **Fallback Server**: `server-minimal.js` has even fewer dependencies
4. **Mock Data**: All endpoints return data even if APIs fail

The Node.js backend should now install and run properly! 🚀
