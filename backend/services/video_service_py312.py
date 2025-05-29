import cv2
import numpy as np
from pathlib import Path
import uuid
from typing import List, Dict
import os
import subprocess
import tempfile

class VideoServicePy312:
    """Video service for Python 3.12+ using OpenCV instead of MoviePy"""
    
    def __init__(self):
        self.output_dir = Path("outputs/processed")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = Path("outputs/temp")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def check_ffmpeg(self):
        """Check if ffmpeg is available"""
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
            return True
        except:
            return False
    
    async def stitch_video_with_sfx(self, video_path: str, sfx_path: str, scene_number: int) -> Dict:
        """Combine a video with its sound effect using ffmpeg"""
        
        try:
            if not video_path or not os.path.exists(video_path):
                return {
                    "sceneNumber": scene_number,
                    "videoUrl": f"/api/placeholder-video/{scene_number}",
                    "sfxUrl": sfx_path,
                    "combinedUrl": f"/api/placeholder-video/{scene_number}"
                }
            
            if not self.check_ffmpeg():
                print("Warning: ffmpeg not found. Returning video without audio.")
                return {
                    "sceneNumber": scene_number,
                    "videoUrl": f"/api/videos/{video_path.split('/')[-1]}",
                    "sfxUrl": f"/api/sfx/{sfx_path.split('/')[-1]}" if sfx_path else None,
                    "combinedUrl": f"/api/videos/{video_path.split('/')[-1]}"
                }
            
            output_id = str(uuid.uuid4())
            output_path = self.output_dir / f"{output_id}.mp4"
            
            if sfx_path and os.path.exists(sfx_path):
                # Use ffmpeg to combine video and audio
                cmd = [
                    'ffmpeg', '-i', video_path, '-i', sfx_path,
                    '-c:v', 'copy', '-c:a', 'aac',
                    '-shortest',  # Match shortest stream
                    '-y',  # Overwrite output
                    str(output_path)
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    print(f"FFmpeg error: {result.stderr}")
                    # Copy video without audio as fallback
                    import shutil
                    shutil.copy2(video_path, output_path)
            else:
                # Just copy the video if no audio
                import shutil
                shutil.copy2(video_path, output_path)
            
            return {
                "sceneNumber": scene_number,
                "videoUrl": f"/api/videos/{video_path.split('/')[-1]}",
                "sfxUrl": f"/api/sfx/{sfx_path.split('/')[-1]}" if sfx_path else None,
                "combinedUrl": f"/api/stitched/{output_id}.mp4",
                "combinedPath": str(output_path)
            }
            
        except Exception as e:
            print(f"Error stitching video with SFX: {e}")
            return {
                "sceneNumber": scene_number,
                "videoUrl": f"/api/placeholder-video/{scene_number}",
                "sfxUrl": sfx_path,
                "combinedUrl": f"/api/placeholder-video/{scene_number}"
            }
    
    async def create_final_video(self, stitched_videos: List[Dict], voiceover_path: str) -> Dict:
        """Create the final commercial by combining all scenes with voiceover using ffmpeg"""
        
        try:
            if not self.check_ffmpeg():
                return {
                    "finalVideoUrl": "/api/placeholder-final",
                    "duration": 30,
                    "resolution": "1920x1080",
                    "fileSize": "0MB",
                    "error": "ffmpeg not found"
                }
            
            # Create a text file listing all videos to concatenate
            concat_file = self.temp_dir / f"concat_{uuid.uuid4()}.txt"
            
            valid_videos = []
            for video_data in stitched_videos:
                video_path = video_data.get('combinedPath')
                if video_path and os.path.exists(video_path):
                    valid_videos.append(video_path)
            
            if not valid_videos:
                raise Exception("No valid video clips to process")
            
            # Write concat file
            with open(concat_file, 'w') as f:
                for video_path in valid_videos:
                    f.write(f"file '{os.path.abspath(video_path)}'\n")
            
            # Output path
            final_id = str(uuid.uuid4())
            final_path = self.output_dir / f"final_{final_id}.mp4"
            
            # First, concatenate all videos
            temp_concat = self.temp_dir / f"temp_concat_{final_id}.mp4"
            concat_cmd = [
                'ffmpeg', '-f', 'concat', '-safe', '0',
                '-i', str(concat_file),
                '-c', 'copy',
                '-y', str(temp_concat)
            ]
            
            result = subprocess.run(concat_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Concat error: {result.stderr}")
                raise Exception("Failed to concatenate videos")
            
            # Then add voiceover if provided
            if voiceover_path and os.path.exists(voiceover_path):
                # Mix with voiceover
                final_cmd = [
                    'ffmpeg', '-i', str(temp_concat), '-i', voiceover_path,
                    '-filter_complex', '[0:a][1:a]amerge=inputs=2[a]',
                    '-map', '0:v', '-map', '[a]',
                    '-c:v', 'copy', '-c:a', 'aac',
                    '-ac', '2',  # Stereo output
                    '-y', str(final_path)
                ]
            else:
                # Just copy the concatenated video
                import shutil
                shutil.copy2(temp_concat, final_path)
            
            if voiceover_path and os.path.exists(voiceover_path):
                result = subprocess.run(final_cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    print(f"Audio mix error: {result.stderr}")
                    # Use concatenated video without voiceover as fallback
                    import shutil
                    shutil.copy2(temp_concat, final_path)
            
            # Get file info
            file_size = os.path.getsize(final_path) / (1024 * 1024)  # Convert to MB
            
            # Get video info using OpenCV
            cap = cv2.VideoCapture(str(final_path))
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = frame_count / fps if fps > 0 else 30
            cap.release()
            
            # Clean up temp files
            if os.path.exists(concat_file):
                os.remove(concat_file)
            if os.path.exists(temp_concat):
                os.remove(temp_concat)
            
            return {
                "finalVideoUrl": f"/api/final/{final_id}.mp4",
                "finalVideoPath": str(final_path),
                "duration": duration,
                "resolution": f"{width}x{height}",
                "fileSize": f"{file_size:.1f}MB"
            }
            
        except Exception as e:
            print(f"Error creating final video: {e}")
            return {
                "finalVideoUrl": "/api/placeholder-final",
                "duration": 30,
                "resolution": "1920x1080",
                "fileSize": "0MB",
                "error": str(e)
            }
    
    def generate_thumbnail(self, video_path: str) -> str:
        """Generate a thumbnail from a video using OpenCV"""
        try:
            if not os.path.exists(video_path):
                return None
            
            cap = cv2.VideoCapture(video_path)
            # Get frame at 0.5 seconds
            cap.set(cv2.CAP_PROP_POS_MSEC, 500)
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                thumb_id = video_path.split('/')[-1].replace('.mp4', '')
                thumb_path = self.output_dir / f"thumb_{thumb_id}.jpg"
                cv2.imwrite(str(thumb_path), frame)
                return str(thumb_path)
            
            return None
            
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return None
