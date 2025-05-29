import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { GoogleGenerativeAI } from '@google/generative-ai';
import asyncHandler from 'express-async-handler';
import { fal } from '@fal-ai/client';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8000;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Configure FAL.ai
fal.config({
  credentials: process.env.FAL_API_KEY || ''
});

// Create outputs directories
const outputDir = path.join(__dirname, 'outputs', 'videos');
const sfxDir = path.join(__dirname, 'outputs', 'sfx');
const stitchedDir = path.join(__dirname, 'outputs', 'stitched');
const finalDir = path.join(__dirname, 'outputs', 'final');

// Create all directories
[outputDir, sfxDir, stitchedDir, finalDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Helper function to check if ffmpeg is installed
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('FFmpeg not found. Please install FFmpeg to enable video processing.');
    console.error('Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Linux)');
    return false;
  }
}

// Check ffmpeg on startup
checkFFmpeg().then(hasFFmpeg => {
  if (!hasFFmpeg) {
    console.warn('⚠️  Video processing features will use mock data until FFmpeg is installed');
  }
});

// Helper function to get video duration
async function getVideoDuration(videoPath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 7.5; // Default duration
  }
}

// Helper function to download file from URL
async function downloadFile(url, outputPath) {
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    suggestion: 'Check server logs for details'
  });
};

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Ad Maker Wizard API (Node.js)',
    status: 'running',
    endpoints: {
      health: '/health',
      enhance: '/api/enhance-product-idea',
      script: '/api/generate-script',
      voices: '/api/voices'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      api: 'running',
      gemini: process.env.GOOGLE_API_KEY ? 'configured' : 'missing API key',
      fal: process.env.FAL_API_KEY ? 'configured' : 'missing API key',
      elevenlabs: process.env.ELEVENLABS_API_KEY ? 'configured' : 'missing API key'
    }
  });
});

// Enhance Product Idea
app.post('/api/enhance-product-idea', asyncHandler(async (req, res) => {
  console.log('Enhance request received:', req.body);
  const { idea, mood = 'Professional', audience = 'General audience' } = req.body;
  
  const prompt = `
    You are a world-class product marketing expert. Transform this rough idea into a concrete, compelling product concept:
    
    Rough idea: ${idea}
    Target audience: ${audience}
    Desired mood/tone: ${mood}
    
    Create a SPECIFIC and CONCRETE product concept that includes:
    
    1. What EXACTLY the product does (not vague - be specific!)
    2. The PRIMARY problem it solves for ${audience}
    3. 2-3 UNIQUE features that make it stand out
    4. A clear VALUE PROPOSITION that resonates with ${audience}
    5. Why it fits the ${mood.toLowerCase()} tone
    
    Important guidelines:
    - If the original idea is vague (like "something for productivity"), create a SPECIFIC product concept
    - Include concrete details like how it works, what it looks like, or how people use it
    - Make it sound like a real product that could launch tomorrow
    - Keep it to 2-3 impactful sentences that paint a clear picture
    - Use language that appeals to ${audience} and matches the ${mood.toLowerCase()} tone
    
    Examples of transformations:
    - "Something for fitness" → "FitPulse AI: A smart wristband that uses advanced biometrics to create personalized micro-workouts throughout your day, perfect for busy professionals who struggle to find gym time."
    - "Help people sleep" → "DreamWave: An intelligent sleep system that combines adaptive sound therapy, temperature control, and circadian light adjustment to guarantee deep sleep within 12 minutes."
    
    Now transform the idea into something equally specific and compelling:
  `;
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response
    text = text.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    
    // Ensure it's not too long
    const sentences = text.split('. ');
    if (sentences.length > 3) {
      text = sentences.slice(0, 3).join('. ') + '.';
    }
    
    res.json({ enhancedIdea: text });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    console.error('Full error:', error);
    
    // Better fallback responses based on common categories
    let fallbackIdea;
    const ideaLower = idea.toLowerCase();
    
    if (ideaLower.includes('productivity') || ideaLower.includes('work')) {
      fallbackIdea = `TaskFlow Pro: An AI-powered productivity suite that learns your work patterns and automatically schedules deep focus time, manages interruptions, and prioritizes tasks based on your energy levels - designed for ${audience} who want a ${mood.toLowerCase()} approach to getting more done.`;
    } else if (ideaLower.includes('health') || ideaLower.includes('fitness')) {
      fallbackIdea = `VitalityTrack: A comprehensive health monitoring system that uses advanced sensors to track vital signs, predict health issues, and provide personalized wellness recommendations - perfect for ${audience} seeking a ${mood.toLowerCase()} solution to proactive health management.`;
    } else if (ideaLower.includes('finance') || ideaLower.includes('money')) {
      fallbackIdea = `WealthWise AI: An intelligent financial advisor that analyzes spending patterns, automates savings, and provides personalized investment strategies - ideal for ${audience} who want a ${mood.toLowerCase()} approach to building wealth.`;
    } else if (ideaLower.includes('education') || ideaLower.includes('learn')) {
      fallbackIdea = `LearnSphere: An adaptive learning platform that uses neuroscience principles to optimize retention, creating personalized study paths that adapt to your learning style - perfect for ${audience} seeking a ${mood.toLowerCase()} educational experience.`;
    } else {
      fallbackIdea = `InnovatePro: A revolutionary solution that transforms how ${audience} approach their daily challenges, combining cutting-edge technology with a ${mood.toLowerCase()} user experience to deliver unprecedented results and efficiency.`;
    }
    
    res.json({
      enhancedIdea: fallbackIdea,
      warning: 'Using enhanced fallback due to API error'
    });
  }
}));

// Generate Script
app.post('/api/generate-script', asyncHandler(async (req, res) => {
  const { productName, targetAudience, keyMessage, mood = 'Professional', type = 'scenes', scenes, context } = req.body;
  
  let prompt;
  
  if (type === 'voiceover' && scenes) {
    // Generate voiceover script based on existing scenes
    const sceneDescriptions = scenes.map(scene => 
      `Scene ${scene.number} (${scene.duration}s): ${scene.script}`
    ).join('\n');
    
    prompt = `
      Create a cohesive 30-second voiceover script for a commercial based on these scenes:
      
      Product: ${productName}
      Audience: ${targetAudience}
      Key Message: ${keyMessage}
      Mood: ${mood}
      
      Scenes:
      ${sceneDescriptions}
      
      Create a natural, flowing voiceover that:
      1. Combines the scene scripts into one cohesive narrative
      2. Maintains the ${mood.toLowerCase()} tone throughout
      3. Emphasizes the key message: ${keyMessage}
      4. Totals about 75-80 words (for 30 seconds)
      5. Ends with a clear call to action
      
      Return only the voiceover script text, no formatting or labels.
    `;
  } else {
    // Original scene generation
    prompt = `
      Create a 30-second commercial script with exactly 4 scenes.
      
      Product: ${productName}
      Audience: ${targetAudience}
      Key Message: ${keyMessage}
      Mood: ${mood}
      
      Return a JSON array with 4 scenes, each with:
      - number: 1-4
      - duration: 7.5
      - script: What the voiceover says
      - videoPrompt: Visual description for video generation
      - sfxPrompt: Sound effects description
      
      Return only valid JSON, no additional text.
      Example format:
      [{"number": 1, "duration": 7.5, "script": "...", "videoPrompt": "...", "sfxPrompt": "..."}]
    `;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (type === 'voiceover') {
      // Return voiceover script
      res.json({ voiceoverScript: text.trim() });
    } else {
      // Parse the JSON response for scenes
      let scenes;
      try {
        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        scenes = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Raw response:', text);
        throw new Error('Failed to parse script response');
      }
      
      res.json({ scenes });
    }
  } catch (error) {
    console.error('Script generation error:', error);
    
    if (type === 'voiceover') {
      // Generate voiceover from scenes
      const voiceoverScript = scenes && scenes.length > 0
        ? scenes.map(scene => scene.script).join(' ')
        : `Introducing ${productName} - ${keyMessage}. Perfect for ${targetAudience}. Get started today!`;
      
      res.json({ voiceoverScript });
    } else {
      // Return fallback scenes
      res.json({
        scenes: getFallbackScenes(productName, targetAudience, keyMessage, mood),
        warning: 'Using fallback script due to API error'
      });
    }
  }
}));

// Get available voices from ElevenLabs
app.get('/api/voices', asyncHandler(async (req, res) => {
  console.log('\n=== Fetching ElevenLabs Voices ===');
  
  if (!process.env.ELEVENLABS_API_KEY) {
    console.log('No ElevenLabs API key, returning mock voices');
    return res.json({
      voices: [
        { id: 'voice1', name: 'Sarah', description: 'Warm, friendly female voice' },
        { id: 'voice2', name: 'James', description: 'Professional male voice' },
        { id: 'voice3', name: 'Emma', description: 'Energetic female voice' },
        { id: 'voice4', name: 'Michael', description: 'Authoritative male voice' }
      ]
    });
  }
  
  try {
    const response = await axios.get(
      'https://api.elevenlabs.io/v1/voices',
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        }
      }
    );
    
    // Filter and format voices for the frontend
    const voices = response.data.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      description: `${voice.labels.description || 'Professional voice'} - ${voice.labels.accent || 'Neutral accent'} ${voice.labels.age || ''} ${voice.labels.gender || ''}`.trim(),
      preview_url: voice.preview_url,
      category: voice.category
    }));
    
    console.log(`Found ${voices.length} voices`);
    
    // Return a selection of voices suitable for commercials
    const commercialVoices = voices.filter(voice => 
      voice.category === 'premade' || 
      voice.category === 'professional' ||
      !voice.category
    ).slice(0, 8); // Limit to 8 voices for UI
    
    res.json({ voices: commercialVoices });
    
  } catch (error) {
    console.error('ElevenLabs API error:', error.message);
    
    // Return mock voices as fallback
    res.json({
      voices: [
        { id: 'voice1', name: 'Sarah', description: 'Warm, friendly female voice' },
        { id: 'voice2', name: 'James', description: 'Professional male voice' },
        { id: 'voice3', name: 'Emma', description: 'Energetic female voice' },
        { id: 'voice4', name: 'Michael', description: 'Authoritative male voice' }
      ],
      warning: 'Using mock voices due to API error'
    });
  }
}));

// Generate Video using FAL.ai
app.post('/api/generate-video', asyncHandler(async (req, res) => {
  const { sceneNumber = 1, prompt, duration = 7.5 } = req.body;
  
  console.log(`\n=== Video Generation Request ===`);
  console.log(`Scene: ${sceneNumber}`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Duration: ${duration}`);
  console.log(`Request body:`, req.body);
  
  // Validate prompt
  if (!prompt || prompt.trim() === '') {
    console.error('ERROR: Empty or missing prompt');
    return res.status(400).json({
      error: 'Prompt is required and cannot be empty',
      details: 'The video generation prompt was missing or contained only whitespace',
      sceneNumber
    });
  }
  
  if (!process.env.FAL_API_KEY) {
    // Return mock if no API key
    return res.json({
      sceneNumber,
      videoUrl: `/api/mock-video/${sceneNumber}.mp4`,
      status: 'mock',
      warning: 'FAL_API_KEY not configured'
    });
  }
  
  try {
    console.log(`Generating video for scene ${sceneNumber}...`);
    console.log(`Trimmed prompt: "${prompt.trim()}"`);
    
    // Log FAL configuration
    console.log('FAL API Key configured:', process.env.FAL_API_KEY ? 'Yes' : 'No');
    if (process.env.FAL_API_KEY) {
      console.log('FAL API Key length:', process.env.FAL_API_KEY.length);
    }
    
    // Use the exact format from FAL documentation
    const result = await fal.subscribe('fal-ai/veo2', {
      input: {
        prompt: prompt.trim()
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(`Scene ${sceneNumber} generation progress:`, update.status);
          if (update.logs) {
            update.logs.forEach(log => console.log(`  ${log.message}`));
          }
        }
      }
    });
    
    console.log('FAL Response:', JSON.stringify(result, null, 2));
    console.log('Result type:', typeof result);
    console.log('Result keys:', result ? Object.keys(result) : 'null');
    
    if (result.data) {
      console.log('Result.data type:', typeof result.data);
      console.log('Result.data keys:', Object.keys(result.data));
    }
    
    if (result.requestId) {
      console.log('Request ID:', result.requestId);
    }
    
    // Extract video URL from result.data
    let videoUrl = null;
    
    if (result.data) {
      if (result.data.video && result.data.video.url) {
        videoUrl = result.data.video.url;
      } else if (result.data.video_url) {
        videoUrl = result.data.video_url;
      } else if (result.data.url) {
        videoUrl = result.data.url;
      } else if (typeof result.data === 'string') {
        videoUrl = result.data;
      }
    }
    
    if (videoUrl) {
      const videoId = uuidv4();
      const videoPath = path.join(outputDir, `${videoId}.mp4`);
      
      // Download video file
      console.log(`Downloading video from: ${videoUrl}`);
      const response = await axios.get(videoUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(videoPath);
      
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      console.log(`Video saved to: ${videoPath}`);
      
      res.json({
        sceneNumber,
        videoUrl: `/api/videos/${videoId}.mp4`,
        videoPath,
        thumbnail: `/api/thumbnails/${videoId}.jpg`,
        status: 'success'
      });
    } else {
      throw new Error('No video URL found in FAL response');
    }
  } catch (error) {
    console.error('FAL.ai video generation error:', error);
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    
    // Provide detailed error response
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return res.status(401).json({
        error: 'FAL.ai authentication failed',
        details: 'Check your FAL_API_KEY in the .env file',
        suggestion: 'Ensure the API key format is: UUID:HASH',
        sceneNumber
      });
    } else if (error.message.includes('429')) {
      return res.status(429).json({
        error: 'FAL.ai rate limit exceeded',
        details: 'Too many requests to the video generation API',
        suggestion: 'Wait a moment and try again, or use placeholder videos',
        sceneNumber
      });
    } else if (error.message.includes('400')) {
      return res.status(400).json({
        error: 'Invalid request to FAL.ai',
        details: error.message,
        prompt: prompt,
        sceneNumber
      });
    }
    
    // Return fallback
    res.json({
      sceneNumber,
      videoUrl: `/api/placeholder-video/${sceneNumber}`,
      videoPath: null,
      thumbnail: `/api/placeholder-thumbnail/${sceneNumber}`,
      status: 'error',
      error: error.message
    });
  }
}));

// Serve video files
app.use('/api/videos', express.static(outputDir));

// Serve sound effect files
app.use('/api/sfx', express.static(sfxDir));

// Serve voiceover files
const voiceoverDir = path.join(__dirname, 'outputs', 'voiceovers');
if (!fs.existsSync(voiceoverDir)) {
  fs.mkdirSync(voiceoverDir, { recursive: true });
}
app.use('/api/voiceovers', express.static(voiceoverDir));

// Serve stitched videos
app.use('/api/stitched', express.static(stitchedDir));

// Serve final videos
app.use('/api/final', express.static(finalDir));

// Serve mock final video
app.get('/api/final/commercial.mp4', (req, res) => {
  res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
});

// Serve mock voiceover file
app.get('/api/mock-voiceover/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Create a simple mock audio that's about 30 seconds long
  const sampleRate = 44100;
  const duration = 30; // seconds
  const frequency = 220; // A3 note, lower frequency for voice-like sound
  
  // WAV header
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x08, 0x00, 0x00, // File size (will be updated)
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6D, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Subchunk size
    0x01, 0x00, 0x01, 0x00, // Audio format (PCM), channels (mono)
    0x44, 0xAC, 0x00, 0x00, // Sample rate (44100)
    0x88, 0x58, 0x01, 0x00, // Byte rate
    0x02, 0x00, 0x10, 0x00, // Block align, bits per sample
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x08, 0x00, 0x00  // Data size (will be updated)
  ]);
  
  // Generate a more complex waveform simulating speech patterns
  const samples = [];
  for (let i = 0; i < sampleRate * duration; i++) {
    // Create envelope for more natural sound
    const envelope = Math.sin((i / (sampleRate * duration)) * Math.PI);
    
    // Mix multiple frequencies for richer sound
    const sample = (
      Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3 +
      Math.sin(2 * Math.PI * frequency * 2 * i / sampleRate) * 0.1 +
      Math.sin(2 * Math.PI * frequency * 3 * i / sampleRate) * 0.05
    ) * envelope;
    
    const value = Math.floor(sample * 32767);
    samples.push(value & 0xFF);
    samples.push((value >> 8) & 0xFF);
  }
  
  const audioData = Buffer.from(samples);
  
  // Update header with correct sizes
  const fileSize = 36 + audioData.length;
  wavHeader.writeUInt32LE(fileSize, 4);
  wavHeader.writeUInt32LE(audioData.length, 40);
  
  const fullWav = Buffer.concat([wavHeader, audioData]);
  
  res.set({
    'Content-Type': 'audio/wav',
    'Content-Length': fullWav.length,
    'Content-Disposition': `inline; filename="${filename}"`
  });
  
  res.send(fullWav);
});

// Serve mock sound effect files (create simple beep sounds)
app.get('/api/mock-sfx/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Create a simple beep sound as a placeholder
  // This is a tiny WAV file with a beep
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x08, 0x00, 0x00, // File size
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6D, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Subchunk size
    0x01, 0x00, 0x02, 0x00, // Audio format, channels
    0x44, 0xAC, 0x00, 0x00, // Sample rate (44100)
    0x10, 0xB1, 0x02, 0x00, // Byte rate
    0x04, 0x00, 0x10, 0x00, // Block align, bits per sample
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x08, 0x00, 0x00  // Data size
  ]);
  
  // Generate a simple sine wave beep
  const sampleRate = 44100;
  const duration = 0.5; // seconds
  const frequency = filename.includes('1') ? 440 : 
                   filename.includes('2') ? 523 : 
                   filename.includes('3') ? 659 : 784;
  
  const samples = [];
  for (let i = 0; i < sampleRate * duration; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    const value = Math.floor(sample * 32767);
    samples.push(value & 0xFF);
    samples.push((value >> 8) & 0xFF);
    samples.push(value & 0xFF);
    samples.push((value >> 8) & 0xFF);
  }
  
  const audioData = Buffer.from(samples);
  const fullWav = Buffer.concat([wavHeader, audioData]);
  
  res.set({
    'Content-Type': 'audio/wav',
    'Content-Length': fullWav.length
  });
  
  res.send(fullWav);
});

// Generate Sound Effects using ElevenLabs
app.post('/api/generate-sfx', asyncHandler(async (req, res) => {
  const { prompt, duration = 7.5, sceneNumber = 1 } = req.body;
  
  console.log(`\n=== Sound Effect Generation Request ===`);
  console.log(`Scene: ${sceneNumber}`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Duration: ${duration}s`);
  
  // Validate prompt
  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({
      error: 'Sound effect prompt is required',
      sceneNumber
    });
  }
  
  if (!process.env.ELEVENLABS_API_KEY) {
    // Return mock if no API key
    console.log('No ElevenLabs API key, returning mock sound effects');
    return res.json({
      soundEffects: [
        { id: 'sfx1', url: `/api/mock-sfx/${sceneNumber}-1.mp3`, name: 'Upbeat' },
        { id: 'sfx2', url: `/api/mock-sfx/${sceneNumber}-2.mp3`, name: 'Energetic' },
        { id: 'sfx3', url: `/api/mock-sfx/${sceneNumber}-3.mp3`, name: 'Calm' },
        { id: 'sfx4', url: `/api/mock-sfx/${sceneNumber}-4.mp3`, name: 'Dramatic' }
      ]
    });
  }
  
  try {
    console.log(`Generating sound effects with ElevenLabs for scene ${sceneNumber}...`);
    
    // Generate 4 variations with different moods
    const moods = ['upbeat', 'energetic', 'calm', 'dramatic'];
    const soundEffects = [];
    
    for (let i = 0; i < moods.length; i++) {
      const mood = moods[i];
      const modifiedPrompt = `${mood} ${prompt}`;
      
      try {
        console.log(`  Generating ${mood} version...`);
        
        // Use ElevenLabs sound effects API
        const response = await axios.post(
          'https://api.elevenlabs.io/v1/sound-generation',
          {
            text: modifiedPrompt,
            duration_seconds: duration,
            prompt_influence: 0.3
          },
          {
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
          }
        );
        
        // Save the audio file
        const audioId = uuidv4();
        const audioPath = path.join(sfxDir, `${audioId}.mp3`);
        
        // Write the audio data directly
        fs.writeFileSync(audioPath, response.data);
        
        console.log(`    ✅ ${mood} audio saved`);
        
        soundEffects.push({
          id: `sfx${i + 1}`,
          url: `/api/sfx/${audioId}.mp3`,
          name: mood.charAt(0).toUpperCase() + mood.slice(1)
        });
        
      } catch (error) {
        console.error(`    ❌ Failed to generate ${mood} version:`, error.message);
        
        // If it's a 401 error, the API key is invalid
        if (error.response && error.response.status === 401) {
          console.error('    Invalid ElevenLabs API key');
        }
        
        // Add a placeholder for this variation
        soundEffects.push({
          id: `sfx${i + 1}`,
          url: `/api/mock-sfx/${sceneNumber}-${i + 1}.mp3`,
          name: mood.charAt(0).toUpperCase() + mood.slice(1),
          error: error.message
        });
      }
    }
    
    // If we got at least one successful generation, return them
    if (soundEffects.some(sfx => !sfx.error)) {
      console.log(`✅ Generated ${soundEffects.filter(sfx => !sfx.error).length} sound effects`);
      res.json({ soundEffects });
    } else {
      throw new Error('Failed to generate any sound effects');
    }
    
  } catch (error) {
    console.error('Sound effect generation error:', error);
    
    // Return fallback mock data
    res.json({
      soundEffects: [
        { id: 'sfx1', url: `/api/mock-sfx/${sceneNumber}-1.mp3`, name: 'Option 1' },
        { id: 'sfx2', url: `/api/mock-sfx/${sceneNumber}-2.mp3`, name: 'Option 2' },
        { id: 'sfx3', url: `/api/mock-sfx/${sceneNumber}-3.mp3`, name: 'Option 3' },
        { id: 'sfx4', url: `/api/mock-sfx/${sceneNumber}-4.mp3`, name: 'Option 4' }
      ],
      error: error.message
    });
  }
}));

// Generate voiceover using ElevenLabs
app.post('/api/generate-voiceover', asyncHandler(async (req, res) => {
  const { text, voiceId, voiceName } = req.body;
  
  console.log('\n=== Voiceover Generation Request ===');
  console.log(`Voice: ${voiceName} (${voiceId})`);
  console.log(`Text length: ${text?.length || 0} characters`);
  
  // Validate input
  if (!text || text.trim() === '') {
    return res.status(400).json({
      error: 'Voiceover text is required'
    });
  }
  
  if (!process.env.ELEVENLABS_API_KEY) {
    console.log('No ElevenLabs API key, returning mock voiceover');
    return res.json({
      audioUrl: '/api/mock-voiceover/final.mp3',
      duration: 30,
      voiceUsed: voiceName || 'Default Voice',
      warning: 'ELEVENLABS_API_KEY not configured'
    });
  }
  
  try {
    // If no voiceId provided, get the first available voice
    let selectedVoiceId = voiceId;
    let selectedVoiceName = voiceName;
    
    if (!selectedVoiceId) {
      console.log('No voice ID provided, fetching default voice...');
      const voicesResponse = await axios.get(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY
          }
        }
      );
      
      if (voicesResponse.data.voices.length > 0) {
        // Try to find a voice named Adam or Rachel (good defaults)
        const defaultVoice = voicesResponse.data.voices.find(v => 
          v.name.toLowerCase().includes('adam') || 
          v.name.toLowerCase().includes('rachel')
        ) || voicesResponse.data.voices[0];
        
        selectedVoiceId = defaultVoice.voice_id;
        selectedVoiceName = defaultVoice.name;
        console.log(`Using default voice: ${selectedVoiceName}`);
      }
    }
    
    console.log(`Generating voiceover with voice ${selectedVoiceId}...`);
    
    // Generate the voiceover
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        text: text.trim(),
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Save the audio file
    const audioId = uuidv4();
    const voiceoverDir = path.join(__dirname, 'outputs', 'voiceovers');
    if (!fs.existsSync(voiceoverDir)) {
      fs.mkdirSync(voiceoverDir, { recursive: true });
    }
    
    const audioPath = path.join(voiceoverDir, `${audioId}.mp3`);
    fs.writeFileSync(audioPath, response.data);
    
    console.log(`Voiceover saved to: ${audioPath}`);
    console.log(`File size: ${(response.data.length / 1024).toFixed(2)} KB`);
    
    // Calculate approximate duration (rough estimate)
    const wordsPerMinute = 150;
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const estimatedDuration = Math.ceil((wordCount / wordsPerMinute) * 60);
    
    res.json({
      audioUrl: `/api/voiceovers/${audioId}.mp3`,
      audioPath,
      duration: estimatedDuration,
      voiceUsed: selectedVoiceName,
      wordCount,
      fileSize: `${(response.data.length / 1024).toFixed(2)} KB`,
      status: 'success'
    });
    
  } catch (error) {
    console.error('ElevenLabs voiceover generation error:', error);
    
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      if (error.response.status === 401) {
        return res.status(401).json({
          error: 'Invalid ElevenLabs API key',
          suggestion: 'Check your ELEVENLABS_API_KEY in .env file'
        });
      } else if (error.response.status === 422) {
        return res.status(422).json({
          error: 'Invalid request format',
          details: error.response.data
        });
      } else if (error.response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded or insufficient credits',
          suggestion: 'Check your ElevenLabs account credits'
        });
      }
    }
    
    // Return fallback mock data
    res.json({
      audioUrl: '/api/mock-voiceover/final.mp3',
      duration: 30,
      voiceUsed: voiceName || 'Default Voice',
      status: 'error',
      error: error.message
    });
  }
}));

// Stitch videos with sound effects
app.post('/api/stitch-videos', asyncHandler(async (req, res) => {
  const { videos = [], soundEffects = [] } = req.body;
  
  console.log('\n=== Video Stitching Request ===');
  console.log(`Processing ${videos.length} videos`);
  
  const hasFFmpeg = await checkFFmpeg();
  
  if (!hasFFmpeg) {
    // Return mock data if ffmpeg not available
    const stitchedVideos = videos.map((video, index) => ({
      sceneNumber: video.sceneNumber || index + 1,
      videoUrl: video.videoUrl,
      sfxUrl: soundEffects[index]?.selectedSfx?.url || '',
      combinedUrl: `/api/stitched/scene-${index + 1}.mp4`
    }));
    
    return res.json({ 
      stitchedVideos,
      warning: 'Using mock data - FFmpeg not installed' 
    });
  }
  
  try {
    const stitchedVideos = [];
    
    // Process each video
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const sfx = soundEffects[i]?.selectedSfx;
      const sceneNumber = video.sceneNumber || i + 1;
      
      console.log(`\nProcessing scene ${sceneNumber}...`);
      
      // Generate unique ID for stitched video
      const stitchedId = uuidv4();
      const outputPath = path.join(stitchedDir, `${stitchedId}.mp4`);
      
      // Handle local or remote video URLs
      let videoPath = video.videoPath;
      if (!videoPath && video.videoUrl) {
        if (video.videoUrl.startsWith('/api/videos/')) {
          // Local file
          const filename = video.videoUrl.replace('/api/videos/', '');
          videoPath = path.join(outputDir, filename);
        } else if (video.videoUrl.startsWith('http')) {
          // Download remote file
          const tempVideoPath = path.join(stitchedDir, `temp_video_${sceneNumber}.mp4`);
          await downloadFile(video.videoUrl, tempVideoPath);
          videoPath = tempVideoPath;
        }
      }
      
      // Check if video file exists
      if (!videoPath || !fs.existsSync(videoPath)) {
        console.error(`Video file not found for scene ${sceneNumber}`);
        stitchedVideos.push({
          sceneNumber,
          videoUrl: video.videoUrl,
          sfxUrl: sfx?.url || '',
          combinedUrl: video.videoUrl, // Use original if can't process
          error: 'Video file not found'
        });
        continue;
      }
      
      // If no sound effect, just copy the video
      if (!sfx || !sfx.url) {
        console.log('No sound effect, copying video as-is');
        await execAsync(`cp "${videoPath}" "${outputPath}"`);
      } else {
        // Download or locate sound effect
        let sfxPath;
        if (sfx.url.startsWith('/api/sfx/')) {
          const filename = sfx.url.replace('/api/sfx/', '');
          sfxPath = path.join(sfxDir, filename);
        } else if (sfx.url.startsWith('/api/mock-sfx/')) {
          // For mock SFX, we'll skip adding audio
          console.log('Mock SFX detected, copying video without audio mix');
          await execAsync(`cp "${videoPath}" "${outputPath}"`);
          sfxPath = null;
        } else if (sfx.url.startsWith('http')) {
          const tempSfxPath = path.join(stitchedDir, `temp_sfx_${sceneNumber}.mp3`);
          await downloadFile(sfx.url, tempSfxPath);
          sfxPath = tempSfxPath;
        }
        
        // Mix video with sound effect if we have a real SFX file
        if (sfxPath && fs.existsSync(sfxPath)) {
          console.log('Mixing video with sound effect...');
          
          // Get video duration to loop the sound effect if needed
          const duration = await getVideoDuration(videoPath);
          
          // Check if video has audio track
          let hasAudio = false;
          try {
            const { stdout } = await execAsync(
              `ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "${videoPath}"`
            );
            hasAudio = stdout.trim() === 'audio';
          } catch (e) {
            console.log('Could not detect audio track, assuming no audio');
          }
          
          let ffmpegCmd;
          if (hasAudio) {
            // Video has audio, mix it
            ffmpegCmd = `ffmpeg -i "${videoPath}" -stream_loop -1 -i "${sfxPath}" ` +
              `-t ${duration} ` +
              `-filter_complex "[1:a]volume=0.3[sfx];[0:a][sfx]amix=inputs=2:duration=first:dropout_transition=2[aout]" ` +
              `-map 0:v -map "[aout]" ` +
              `-c:v copy -c:a aac -b:a 192k ` +
              `-shortest -y "${outputPath}"`;
          } else {
            // Video has no audio, just add the sound effect
            ffmpegCmd = `ffmpeg -i "${videoPath}" -stream_loop -1 -i "${sfxPath}" ` +
              `-t ${duration} ` +
              `-filter_complex "[1:a]volume=0.3[aout]" ` +
              `-map 0:v -map "[aout]" ` +
              `-c:v copy -c:a aac -b:a 192k ` +
              `-shortest -y "${outputPath}"`;
          }
          
          await execAsync(ffmpegCmd);
        }
      }
      
      // Clean up temp files
      if (videoPath.includes('temp_video_')) {
        fs.unlinkSync(videoPath);
      }
      if (sfx?.url && sfx.url.includes('temp_sfx_')) {
        const tempSfxPath = path.join(stitchedDir, `temp_sfx_${sceneNumber}.mp3`);
        if (fs.existsSync(tempSfxPath)) {
          fs.unlinkSync(tempSfxPath);
        }
      }
      
      stitchedVideos.push({
        sceneNumber,
        videoUrl: video.videoUrl,
        sfxUrl: sfx?.url || '',
        combinedUrl: `/api/stitched/${stitchedId}.mp4`,
        outputPath
      });
      
      console.log(`✅ Scene ${sceneNumber} processed successfully`);
    }
    
    console.log('\n✅ All videos stitched successfully');
    res.json({ stitchedVideos });
    
  } catch (error) {
    console.error('Video stitching error:', error);
    
    // Return partial results or mock data
    const stitchedVideos = videos.map((video, index) => ({
      sceneNumber: video.sceneNumber || index + 1,
      videoUrl: video.videoUrl,
      sfxUrl: soundEffects[index]?.selectedSfx?.url || '',
      combinedUrl: video.videoUrl,
      error: error.message
    }));
    
    res.json({ stitchedVideos, error: error.message });
  }
}));

// Create final video with voiceover
app.post('/api/create-final-video', asyncHandler(async (req, res) => {
  const { stitchedVideos = [], voiceoverUrl, productName } = req.body;
  
  console.log('\n=== Final Video Creation Request ===');
  console.log(`Product: ${productName}`);
  console.log(`Scenes: ${stitchedVideos.length}`);
  console.log(`Voiceover: ${voiceoverUrl ? 'Yes' : 'No'}`);
  
  const hasFFmpeg = await checkFFmpeg();
  
  if (!hasFFmpeg) {
    // Return mock data if ffmpeg not available
    return res.json({
      finalVideoUrl: '/api/final/commercial.mp4',
      duration: 30,
      resolution: '1920x1080',
      fileSize: '25MB',
      warning: 'Using mock data - FFmpeg not installed'
    });
  }
  
  try {
    // Generate unique ID for final video
    const finalId = uuidv4();
    const outputPath = path.join(finalDir, `${finalId}.mp4`);
    
    // Create a text file listing all videos to concatenate
    const concatListPath = path.join(finalDir, `concat_${finalId}.txt`);
    const videoList = [];
    
    // Process each stitched video
    for (const video of stitchedVideos) {
      let videoPath;
      
      if (video.outputPath && fs.existsSync(video.outputPath)) {
        videoPath = video.outputPath;
      } else if (video.combinedUrl) {
        if (video.combinedUrl.startsWith('/api/stitched/')) {
          const filename = video.combinedUrl.replace('/api/stitched/', '');
          videoPath = path.join(stitchedDir, filename);
        } else if (video.combinedUrl.startsWith('/api/videos/')) {
          const filename = video.combinedUrl.replace('/api/videos/', '');
          videoPath = path.join(outputDir, filename);
        }
      }
      
      if (videoPath && fs.existsSync(videoPath)) {
        videoList.push(`file '${videoPath}'`);
      } else {
        console.warn(`Video not found for scene ${video.sceneNumber}`);
      }
    }
    
    if (videoList.length === 0) {
      throw new Error('No valid videos found to concatenate');
    }
    
    // Write concat list
    fs.writeFileSync(concatListPath, videoList.join('\n'));
    
    // First, concatenate all videos
    const tempConcatPath = path.join(finalDir, `temp_concat_${finalId}.mp4`);
    console.log('Concatenating videos...');
    
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${concatListPath}" ` +
      `-c:v libx264 -preset fast -crf 23 ` +
      `-c:a aac -b:a 192k ` +
      `-y "${tempConcatPath}"`
    );
    
    // Handle voiceover
    if (voiceoverUrl) {
      let voiceoverPath;
      
      if (voiceoverUrl.startsWith('/api/voiceovers/')) {
        const filename = voiceoverUrl.replace('/api/voiceovers/', '');
        voiceoverPath = path.join(voiceoverDir, filename);
      } else if (voiceoverUrl.startsWith('/api/mock-voiceover/')) {
        // Skip mock voiceover
        console.log('Mock voiceover detected, using video audio only');
        await execAsync(`mv "${tempConcatPath}" "${outputPath}"`);
      } else if (voiceoverUrl.startsWith('http')) {
        const tempVoPath = path.join(finalDir, `temp_vo_${finalId}.mp3`);
        await downloadFile(voiceoverUrl, tempVoPath);
        voiceoverPath = tempVoPath;
      }
      
      if (voiceoverPath && fs.existsSync(voiceoverPath)) {
        console.log('Adding voiceover to final video...');
        
        // Check if concatenated video has audio
        let hasAudio = false;
        try {
          const { stdout } = await execAsync(
            `ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "${tempConcatPath}"`
          );
          hasAudio = stdout.trim() === 'audio';
          console.log('Concatenated video has audio:', hasAudio);
        } catch (e) {
          console.log('Could not detect audio track in concatenated video');
        }
        
        if (hasAudio) {
          // Mix voiceover with existing audio
          await execAsync(
            `ffmpeg -i "${tempConcatPath}" -i "${voiceoverPath}" ` +
            `-filter_complex "[0:a]volume=0.3[bg];[1:a]volume=1.0[vo];[bg][vo]amix=inputs=2:duration=first:dropout_transition=2[aout]" ` +
            `-map 0:v -map "[aout]" ` +
            `-c:v copy -c:a aac -b:a 192k ` +
            `-shortest -y "${outputPath}"`
          );
        } else {
          // No existing audio, just add voiceover
          await execAsync(
            `ffmpeg -i "${tempConcatPath}" -i "${voiceoverPath}" ` +
            `-map 0:v -map 1:a ` +
            `-c:v copy -c:a aac -b:a 192k ` +
            `-shortest -y "${outputPath}"`
          );
        }
        
        // Clean up temp voiceover
        if (voiceoverPath.includes('temp_vo_')) {
          fs.unlinkSync(voiceoverPath);
        }
      }
    } else {
      // No voiceover, just use concatenated video
      await execAsync(`mv "${tempConcatPath}" "${outputPath}"`);
    }
    
    // Clean up temp files
    fs.unlinkSync(concatListPath);
    if (fs.existsSync(tempConcatPath)) {
      fs.unlinkSync(tempConcatPath);
    }
    
    // Get final video info
    const stats = fs.statSync(outputPath);
    const duration = await getVideoDuration(outputPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Get video resolution
    let resolution = '1920x1080';
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${outputPath}"`
      );
      if (stdout.trim()) {
        resolution = stdout.trim();
      }
    } catch (error) {
      console.warn('Could not get video resolution');
    }
    
    console.log(`\n✅ Final video created successfully!`);
    console.log(`  Duration: ${duration.toFixed(1)}s`);
    console.log(`  Resolution: ${resolution}`);
    console.log(`  File size: ${fileSizeMB}MB`);
    
    res.json({
      finalVideoUrl: `/api/final/${finalId}.mp4`,
      outputPath,
      duration: Math.round(duration),
      resolution,
      fileSize: `${fileSizeMB}MB`,
      productName
    });
    
  } catch (error) {
    console.error('Final video creation error:', error);
    
    // Return mock data as fallback
    res.json({
      finalVideoUrl: '/api/final/commercial.mp4',
      duration: 30,
      resolution: '1920x1080',
      fileSize: '25MB',
      error: error.message
    });
  }
}));

app.post('/api/generate-social-posts', (req, res) => {
  const { productName, targetAudience, keyMessage } = req.body;
  res.json({
    posts: {
      twitter: `🚀 Introducing ${productName}! ${keyMessage} Perfect for ${targetAudience}. #Innovation #NewProduct`,
      linkedin: `Excited to announce ${productName}! ${keyMessage}\n\nDesigned specifically for ${targetAudience}, this is a game-changer.\n\n#Innovation #BusinessGrowth`
    }
  });
});

// Helper function for fallback scenes
function getFallbackScenes(productName, targetAudience, keyMessage, mood) {
  return [
    {
      number: 1,
      duration: 7.5,
      script: `In a world where ${targetAudience} face daily challenges...`,
      videoPrompt: `Opening scene showing ${targetAudience} in relatable situations`,
      sfxPrompt: `${mood} music building up, ambient sounds`
    },
    {
      number: 2,
      duration: 7.5,
      script: `Introducing ${productName} - ${keyMessage}`,
      videoPrompt: `Product reveal with dynamic visuals, showing key features`,
      sfxPrompt: `Music transitions to hopeful tone, product sounds`
    },
    {
      number: 3,
      duration: 7.5,
      script: `See how ${productName} transforms your experience`,
      videoPrompt: `Happy customers using the product, testimonials`,
      sfxPrompt: `Uplifting music, success sounds`
    },
    {
      number: 4,
      duration: 7.5,
      script: `Join thousands who've made the switch. ${productName} - Start today!`,
      videoPrompt: `Call to action with website, logo, and special offer`,
      sfxPrompt: `Music reaches crescendo, memorable closing`
    }
  ];
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    suggestion: 'Check the root endpoint for available routes'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  const hasFFmpeg = await checkFFmpeg();
  
  console.log(`
  ================================
  Ad Maker Wizard API (Node.js)
  ================================
  Server running on port ${PORT}
  Health check: http://localhost:${PORT}/health
  API Docs: http://localhost:${PORT}
  
  Environment:
  - GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Missing'}
  - FAL_API_KEY: ${process.env.FAL_API_KEY ? '✅ Set' : '❌ Missing'}
  - ELEVENLABS_API_KEY: ${process.env.ELEVENLABS_API_KEY ? '✅ Set' : '❌ Missing'}
  - FFmpeg: ${hasFFmpeg ? '✅ Installed' : '❌ Not installed (video processing will use mock data)'}
  
  Video generation: ${process.env.FAL_API_KEY ? 'Using Google Veo 2 via FAL.ai' : 'Using mock data'}
  Voice generation: ${process.env.ELEVENLABS_API_KEY ? 'Using ElevenLabs AI' : 'Using mock data'}
  Video processing: ${hasFFmpeg ? 'Real video processing enabled' : 'Install FFmpeg for video processing'}
  ================================
  `);
});
