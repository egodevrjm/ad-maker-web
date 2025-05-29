import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Video, Play, RefreshCw, Download, AlertCircle, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { saveExpensiveData, loadExpensiveData } from '../../utils/stateManager'

const VideoGeneration = ({ data, updateData, onNext, setIsLoading }) => {
  const [videos, setVideos] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const [usePlaceholders, setUsePlaceholders] = useState(false)
  
  // Use a ref to track if generation has started to prevent multiple calls
  const generationStarted = useRef(false)

  useEffect(() => {
    // Check if we have saved videos for this product
    if (data.productName && !generationStarted.current) {
      const savedData = loadExpensiveData('videos', data.productName)
      if (savedData && savedData.videos && savedData.videos.length > 0) {
        setVideos(savedData.videos)
        updateData({ videos: savedData.videos })
        toast.success('Loaded previously generated videos - skipping expensive regeneration!')
        generationStarted.current = true
        return
      }
    }
    
    if (!generationStarted.current && videos.length === 0 && data.scenes.length > 0) {
      generationStarted.current = true
      generateVideos()
    }
  }, [data.scenes, data.productName])

  const generateVideos = async () => {
    setIsGenerating(true)
    setIsLoading(true)
    
    try {
      // Debug: Log the scenes we received
      console.log('Scenes data:', data.scenes)
      
      // Ensure we have valid scenes with prompts
      const validScenes = data.scenes.filter(scene => {
        // Check both videoPrompt and prompt fields
        const hasPrompt = (scene.videoPrompt && scene.videoPrompt.trim() !== "") || 
                         (scene.prompt && scene.prompt.trim() !== "")
        
        if (!hasPrompt) {
          console.warn(`Scene ${scene.number} has no valid prompt:`, scene)
        }
        
        return hasPrompt
      })
      
      if (validScenes.length === 0) {
        toast.error('No valid video prompts found in scenes. Please regenerate the script.')
        setIsGenerating(false)
        setIsLoading(false)
        return
      }
      
      // Log what we're sending
      console.log('Generating videos for scenes:', validScenes.map(s => ({
        number: s.number,
        prompt: s.videoPrompt || s.prompt,
        duration: s.duration
      })))
      
      // Generate videos sequentially to avoid overwhelming the API
      const generatedVideos = []
      
      for (let i = 0; i < validScenes.length; i++) {
        const scene = validScenes[i]
        setCurrentScene(i)
        
        try {
          if (usePlaceholders) {
            // Use placeholder
            generatedVideos.push({
              sceneNumber: scene.number,
              videoUrl: `/api/placeholder-video/${scene.number}`,
              thumbnail: `/api/placeholder-thumbnail/${scene.number}`
            })
          } else {
            // Make API call
            console.log(`Generating video for scene ${scene.number}:`)
            console.log('Scene object:', scene)
            
            // Use videoPrompt if available, otherwise fall back to prompt
            const promptText = scene.videoPrompt || scene.prompt
            console.log('Using prompt:', promptText)
            
            if (!promptText || promptText.trim() === "") {
              throw new Error(`No valid prompt for scene ${scene.number}`)
            }
            
            const requestData = {
              prompt: promptText.trim(),
              duration: scene.duration || 7.5,
              sceneNumber: scene.number
            }
            
            console.log('Sending to API:', requestData)
            
            const response = await api.generateVideo(requestData)
            console.log('API Response:', response.data)
            
            generatedVideos.push(response.data)
          }
          
          // Update videos as they complete
          setVideos([...generatedVideos])
          
        } catch (error) {
          console.error(`Error generating video for scene ${scene.number}:`, error)
          console.error('Error details:', error.response?.data)
          
          // Show specific error message
          if (error.response?.status === 400) {
            toast.error(`Scene ${scene.number}: ${error.response.data.error || 'Invalid request'}`)
          } else {
            toast.error(`Scene ${scene.number}: ${error.message}`)
          }
          
          // Add placeholder for failed scene
          generatedVideos.push({
            sceneNumber: scene.number,
            videoUrl: `/api/placeholder-video/${scene.number}`,
            thumbnail: `/api/placeholder-thumbnail/${scene.number}`,
            error: error.response?.data?.error || error.message
          })
        }
      }
      
      updateData({ videos: generatedVideos })
      
      // Save expensive video data
      if (generatedVideos.length > 0 && data.productName) {
        const dataToSave = {
          videos: generatedVideos,
          productName: data.productName,
          timestamp: new Date().toISOString()
        }
        saveExpensiveData('videos', dataToSave)
        toast.success('All videos generated and saved successfully!')
      } else {
        toast.success('All videos generated successfully!')
      }
      
    } catch (error) {
      console.error('Error generating videos:', error)
      toast.error('Failed to generate videos. Using placeholders.')
      
      // Fallback to all placeholders
      const placeholderVideos = data.scenes.map(scene => ({
        sceneNumber: scene.number,
        videoUrl: `/api/placeholder-video/${scene.number}`,
        thumbnail: `/api/placeholder-thumbnail/${scene.number}`
      }))
      
      setVideos(placeholderVideos)
      updateData({ videos: placeholderVideos })
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  const regenerateVideo = async (sceneIndex) => {
    setIsLoading(true)
    
    try {
      const scene = data.scenes[sceneIndex]
      
      // Check both videoPrompt and prompt fields
      const promptText = scene.videoPrompt || scene.prompt
      
      if (!promptText || promptText.trim() === "") {
        toast.error('No video prompt available for this scene')
        setIsLoading(false)
        return
      }
      
      console.log(`Regenerating video for scene ${scene.number}:`, promptText)
      
      const response = await api.generateVideo({
        prompt: promptText.trim(),
        duration: scene.duration || 7.5,
        sceneNumber: scene.number
      })
      
      const updatedVideos = [...videos]
      updatedVideos[sceneIndex] = response.data
      setVideos(updatedVideos)
      updateData({ videos: updatedVideos })
      
      toast.success(`Scene ${scene.number} regenerated!`)
    } catch (error) {
      console.error('Failed to regenerate video:', error)
      console.error('Error details:', error.response?.data)
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Invalid request')
      } else {
        toast.error('Failed to regenerate video')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (videos.length === 0) {
      toast.error('Please generate videos before continuing')
      return
    }
    onNext()
  }

  // Placeholder cards for scenes that haven't been generated yet
  const PlaceholderCard = ({ sceneNumber }) => (
    <div className="glass-card p-6 opacity-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Scene {sceneNumber}</h3>
      </div>
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-300 rounded-full mb-2">
              <Video className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500">Waiting to generate...</p>
          </div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )

  // Debug info component
  const DebugInfo = () => {
    if (!data.scenes || data.scenes.length === 0) return null
    
    return (
      <details className="mb-4 p-4 bg-gray-50 rounded-lg">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">
          Debug: Scene Data
        </summary>
        <pre className="mt-2 text-xs text-gray-600 overflow-auto">
          {JSON.stringify(data.scenes.map(s => ({
            number: s.number,
            hasVideoPrompt: !!s.videoPrompt,
            hasPrompt: !!s.prompt,
            videoPrompt: s.videoPrompt,
            prompt: s.prompt
          })), null, 2)}
        </pre>
      </details>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Video Generation
          </h2>
          <p className="text-gray-600 mb-4">
            Creating stunning visuals for each scene with AI
          </p>
          
          {/* API Toggle */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 mb-2">
                Video generation requires FAL.ai API access. You can use placeholders for testing.
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePlaceholders}
                  onChange={(e) => {
                    setUsePlaceholders(e.target.checked)
                    if (videos.length === 0 && !generationStarted.current) {
                      generationStarted.current = true
                      generateVideos()
                    }
                  }}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  disabled={isGenerating}
                />
                <span className="text-sm text-gray-700">Use placeholder videos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Debug Info - Only show in development */}
        <DebugInfo />

        {/* Save Status Indicator */}
        {videos.length > 0 && !isGenerating && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Save className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              Videos saved and will be reused if you return to this step
            </span>
          </div>
        )}

        {/* Progress Banner - Always show when generating */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Generating {data.scenes.length} videos... Currently on scene {currentScene + 1}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {videos.length} completed, {data.scenes.length - videos.length} remaining (30-60s per video)
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {data.scenes.map((_, index) => (
                  <div
                    key={index}
                    className={`w-8 h-2 rounded-full transition-all duration-300 ${
                      index < videos.length
                        ? 'bg-green-500'
                        : index === currentScene
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Video Grid - Always show grid layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Show completed videos */}
          {videos.map((video, index) => (
            <motion.div
              key={`video-${video.sceneNumber}-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Scene {video.sceneNumber}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => regenerateVideo(index)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Regenerate video"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <a
                    href={video.videoUrl}
                    download={`scene-${video.sceneNumber}.mp4`}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download video"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3">
                {video.error ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                      <p className="text-white text-sm">Failed to generate video</p>
                      <p className="text-gray-400 text-xs mt-1">{video.error}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnail}
                      controls
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Scene Info */}
              {data.scenes[index] && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {data.scenes[index].script || data.scenes[index].videoPrompt || data.scenes[index].prompt}
                </p>
              )}
            </motion.div>
          ))}
          
          {/* Show placeholder cards for remaining scenes */}
          {isGenerating && data.scenes.slice(videos.length).map((scene, index) => (
            <PlaceholderCard 
              key={`placeholder-${scene.number}`} 
              sceneNumber={scene.number} 
            />
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {isGenerating ? (
              `Generating videos... ${videos.length} of ${data.scenes.length} completed`
            ) : (
              `${videos.filter(v => !v.error).length} of ${videos.length} videos generated successfully`
            )}
          </p>
          
          <button
            onClick={handleNext}
            className={`px-6 py-3 text-white font-medium rounded-lg transition-all duration-300 ${
              isGenerating || videos.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg'
            }`}
            disabled={isGenerating || videos.length === 0}
          >
            {isGenerating ? 'Please wait...' : 'Continue to Sound Effects'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default VideoGeneration
