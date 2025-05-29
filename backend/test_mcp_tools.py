#!/usr/bin/env python3
"""
Helper script to test ElevenLabs MCP tools directly
This demonstrates how to use the MCP tools from Python
"""

import os
import json
from pathlib import Path

# Example of how to use ElevenLabs MCP tools in production

def test_elevenlabs_with_mcp():
    """
    This function demonstrates how you would integrate the ElevenLabs MCP tools
    directly into your Python backend if needed.
    """
    
    print("ElevenLabs MCP Tool Integration Examples")
    print("=" * 50)
    
    # Set output directory
    output_dir = Path("outputs/audio")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("\n1. Generate Sound Effects:")
    print("   Command: text_to_sound_effects")
    print("   Example usage:")
    print(f'   text_to_sound_effects --text "upbeat corporate music" --duration_seconds 7.5 --output_directory {output_dir}')
    
    print("\n2. List Available Voices:")
    print("   Command: search_voices")
    print("   Example usage:")
    print('   search_voices --search "american female"')
    
    print("\n3. Generate Voiceover:")
    print("   Command: text_to_speech")
    print("   Example usage:")
    print(f'   text_to_speech --text "Your commercial script here" --voice_name "Rachel" --output_directory {output_dir}')
    
    print("\n4. Create AI Voice:")
    print("   Command: text_to_voice")
    print("   Example usage:")
    print(f'   text_to_voice --voice_description "young professional female voice" --output_directory {output_dir}')
    
    print("\n5. Clone a Voice:")
    print("   Command: voice_clone")
    print("   Example usage:")
    print('   voice_clone --name "Custom Voice" --files "path/to/audio1.mp3" "path/to/audio2.mp3"')
    
    print("\nNote: These commands assume you have the ElevenLabs MCP tools installed and configured.")
    print("In production, you would call these programmatically through the MCP interface.")

def create_mcp_wrapper():
    """
    Creates a Python wrapper for MCP tools
    This would be used in production to integrate MCP tools into the backend
    """
    
    wrapper_code = '''
import subprocess
import json
import os
from typing import Dict, List, Optional

class ElevenLabsMCPWrapper:
    """Wrapper for ElevenLabs MCP tools"""
    
    def __init__(self):
        self.output_dir = "outputs/audio"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def text_to_sound_effects(self, text: str, duration: float = 7.5) -> Dict:
        """Generate sound effects using MCP tool"""
        try:
            cmd = [
                "text_to_sound_effects",
                "--text", text,
                "--duration_seconds", str(duration),
                "--output_directory", self.output_dir
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                # Parse output to get file path
                output = result.stdout
                # Extract file path from output
                return {"success": True, "output": output}
            else:
                return {"success": False, "error": result.stderr}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def search_voices(self, search: Optional[str] = None) -> List[Dict]:
        """Search for available voices"""
        try:
            cmd = ["search_voices"]
            if search:
                cmd.extend(["--search", search])
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                # Parse JSON output
                voices = json.loads(result.stdout)
                return voices
            else:
                return []
        except Exception as e:
            print(f"Error searching voices: {e}")
            return []
    
    def text_to_speech(self, text: str, voice_name: str) -> Dict:
        """Generate speech from text"""
        try:
            cmd = [
                "text_to_speech",
                "--text", text,
                "--voice_name", voice_name,
                "--output_directory", self.output_dir
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return {"success": True, "output": result.stdout}
            else:
                return {"success": False, "error": result.stderr}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Usage example:
if __name__ == "__main__":
    wrapper = ElevenLabsMCPWrapper()
    
    # Generate sound effects
    sfx_result = wrapper.text_to_sound_effects("upbeat corporate music", 7.5)
    print("SFX Result:", sfx_result)
    
    # Search voices
    voices = wrapper.search_voices("female")
    print("Available voices:", voices)
    
    # Generate speech
    tts_result = wrapper.text_to_speech("Hello world", "Rachel")
    print("TTS Result:", tts_result)
'''
    
    wrapper_path = Path("backend/services/elevenlabs_mcp_wrapper.py")
    print(f"\nCreating MCP wrapper at: {wrapper_path}")
    print("This wrapper can be used to integrate MCP tools into your Python backend.")
    print("\nWrapper code preview:")
    print("-" * 50)
    print(wrapper_code[:500] + "...")
    print("-" * 50)
    
    return wrapper_code

if __name__ == "__main__":
    test_elevenlabs_with_mcp()
    print("\n" + "=" * 50)
    create_mcp_wrapper()
