# Port Configuration Update

Your Ad Maker Wizard is configured to use **port 3000** for the frontend, not 5173. This avoids conflicts with your other local web app.

## Current Configuration:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## If You Need to Change the Port:

To use a different port (e.g., 3001), update these files:

1. **Frontend port** - `/frontend/vite.config.js`:
   ```js
   server: {
     port: 3001,  // Change this
     proxy: {
       '/api': {
         target: 'http://localhost:8000',
         changeOrigin: true,
       }
     }
   }
   ```

2. **Backend CORS** - `/backend/main.py`:
   ```python
   allow_origins=["http://localhost:3001"]  # Update to match
   ```

3. **Environment file** - `/backend/.env`:
   ```
   CORS_ORIGINS=http://localhost:3001
   ```

## To Start the App:

```bash
cd /Users//Code/ad-maker-web
python start.py
```

The app will automatically start on port 3000, avoiding any conflicts with your app on port 5173.
