from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip, CompositeAudioClip, concatenate_videoclips
from pathlib import Path
import uuid
from typing import List, Dict
import os

class VideoService:
    def __init__(self):
        self.output_dir = Path("outputs/processed")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = Path("outputs/temp")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    async def stitch_video_with_sfx(self, video_path: str, sfx_path: str, scene_number: int) -> Dict:
        """Combine a video with its sound effect"""
        
        try:
            if not video_path or not os.path.exists(video_path):
                # Use placeholder if video doesn't exist
                return {
                    "sceneNumber": scene_number,
                    "videoUrl": f"/api/placeholder-video/{scene_number}",
                    "sfxUrl": sfx_path,
                    "combinedUrl": f"/api/placeholder-video/{scene_number}"
                }
            
            # Load video and audio
            video = VideoFileClip(video_path)
            
            if sfx_path and os.path.exists(sfx_path):
                sfx = AudioFileClip(sfx_path)
                
                # Adjust SFX duration to match video
                if sfx.duration > video.duration:
                    sfx = sfx.subclip(0, video.duration)
                elif sfx.duration < video.duration:
                    # Loop the SFX if it's shorter
                    loops_needed = int(video.duration / sfx.duration) + 1
                    sfx_clips = [sfx] * loops_needed
                    sfx = concatenate_audioclips(sfx_clips).subclip(0, video.duration)
                
                # Set the audio
                video = video.set_audio(sfx)
            
            # Save the combined video
            output_id = str(uuid.uuid4())
            output_path = self.output_dir / f"{output_id}.mp4"
            
            video.write_videofile(
                str(output_path),
                codec='libx264',
                audio_codec='aac',
                temp_audiofile=str(self.temp_dir / f'temp_audio_{output_id}.m4a'),
                remove_temp=True
            )
            
            # Clean up
            video.close()
            if 'sfx' in locals():
                sfx.close()
            
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
        """Create the final commercial by combining all scenes with voiceover"""
        
        try:
            video_clips = []
            
            # Load all video clips
            for video_data in stitched_videos:
                video_path = video_data.get('combinedPath')
                if video_path and os.path.exists(video_path):
                    clip = VideoFileClip(video_path)
                    video_clips.append(clip)
                else:
                    # Create a placeholder clip if video doesn't exist
                    # This would be a black screen for 7.5 seconds
                    from moviepy.editor import ColorClip
                    placeholder = ColorClip(size=(1920, 1080), color=(0, 0, 0), duration=7.5)
                    video_clips.append(placeholder)
            
            if not video_clips:
                raise Exception("No video clips to process")
            
            # Concatenate all clips
            final_video = concatenate_videoclips(video_clips, method="compose")
            
            # Add voiceover if provided
            if voiceover_path and os.path.exists(voiceover_path):
                voiceover = AudioFileClip(voiceover_path)
                
                # Mix with existing audio (if any)
                if final_video.audio:
                    # Reduce background audio volume
                    background_audio = final_video.audio.volumex(0.3)
                    mixed_audio = CompositeAudioClip([background_audio, voiceover])
                    final_video = final_video.set_audio(mixed_audio)
                else:
                    final_video = final_video.set_audio(voiceover)
            
            # Save final video
            final_id = str(uuid.uuid4())
            final_path = self.output_dir / f"final_{final_id}.mp4"
            
            final_video.write_videofile(
                str(final_path),
                codec='libx264',
                audio_codec='aac',
                fps=24,
                preset='medium',
                temp_audiofile=str(self.temp_dir / f'temp_audio_final_{final_id}.m4a'),
                remove_temp=True
            )
            
            # Get file info
            file_size = os.path.getsize(final_path) / (1024 * 1024)  # Convert to MB
            
            # Clean up
            final_video.close()
            for clip in video_clips:
                clip.close()
            
            return {
                "finalVideoUrl": f"/api/final/{final_id}.mp4",
                "finalVideoPath": str(final_path),
                "duration": final_video.duration,
                "resolution": f"{final_video.w}x{final_video.h}",
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
        """Generate a thumbnail from a video"""
        try:
            if not os.path.exists(video_path):
                return None
                
            video = VideoFileClip(video_path)
            frame = video.get_frame(0.5)  # Get frame at 0.5 seconds
            
            thumb_id = video_path.split('/')[-1].replace('.mp4', '')
            thumb_path = self.output_dir / f"thumb_{thumb_id}.jpg"
            
            from PIL import Image
            import numpy as np
            img = Image.fromarray(np.uint8(frame))
            img.save(thumb_path, quality=85)
            
            video.close()
            return str(thumb_path)
            
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return None


def concatenate_audioclips(clips):
    """Helper function to concatenate audio clips"""
    from moviepy.editor import concatenate_audioclips as concat_audio
    return concat_audio(clips)
