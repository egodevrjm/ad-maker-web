# AI Commercial Generator

A full-stack application that generates complete video commercials from text prompts using AI.

## Features

- **Product Idea Enhancement**: Uses Google Gemini to transform rough ideas into compelling product concepts
- **AI Script Generation**: Creates professional commercial scripts with scene-by-scene breakdowns
- **Video Generation**: Generates video content using Google's VEO 2 (via FAL.ai)
- **Sound Effects**: Creates custom sound effects using ElevenLabs API
- **Voice Over**: Professional narration using ElevenLabs text-to-speech
- **Video Assembly**: Combines all elements into a final commercial using FFmpeg
- **Social Media Posts**: Generates accompanying social media content

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **AI Services**:
  - Google Gemini 2.0 Flash (script generation)
  - Google VEO 2 via FAL.ai (video generation)
  - ElevenLabs (voice & sound effects)
- **Video Processing**: FFmpeg

## Prerequisites

- Node.js (v16 or higher)
- FFmpeg installed on your system
- API keys for:
  - Google Gemini
  - FAL.ai
  - ElevenLabs

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-commercial-generator.git
   cd ai-commercial-generator
   ```

2. Install backend dependencies:
   ```bash
   cd backend-node
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables:
   ```bash
   cd ../backend-node
   cp .env.example .env
   # Edit .env with your API keys
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend-node
   npm start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## Usage

1. Enter a product idea (can be vague like "something for productivity")
2. Select your target audience and mood
3. Follow the wizard through each step:
   - Script generation
   - Video creation
   - Sound effect selection
   - Voice over generation
   - Final video assembly

## Architecture

The application uses an 8-step wizard approach:

1. **Product Information**: Capture and enhance the initial idea
2. **Script Generation**: Create scene-by-scene commercial script
3. **Video Creation**: Generate video clips for each scene
4. **Sound Effects**: Create and select background audio
5. **Video Assembly**: Combine videos with sound effects
6. **Voice Over**: Generate and add narration
7. **Final Video**: Produce the complete commercial
8. **Social Posts**: Generate social media content

## API Endpoints

- `POST /api/enhance-product-idea` - Enhance product concepts
- `POST /api/generate-script` - Generate commercial scripts
- `POST /api/generate-video` - Create video scenes
- `POST /api/generate-sfx` - Generate sound effects
- `POST /api/generate-voiceover` - Create voice narration
- `POST /api/stitch-videos` - Combine video elements
- `POST /api/create-final-video` - Produce final commercial

## Development

The project includes comprehensive error handling and fallback options for when AI services are unavailable.

### State Management

The application saves progress locally, allowing users to resume if they navigate away during generation.

### Performance Considerations

- Videos are processed in parallel where possible
- Generated content is cached locally
- Real-time progress indicators keep users informed

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

Built with assistance from Claude 4 Opus for rapid development.
