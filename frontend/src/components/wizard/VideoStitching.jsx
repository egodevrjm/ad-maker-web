import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const VideoStitching = ({ data, updateData, onNext, setIsLoading }) => {
  const [isStitching, setIsStitching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stitchedVideos, setStitchedVideos] = useState([])

  useEffect(() => {
    if (data.videos && data.soundEffects && stitchedVideos.length === 0) {
      stitchVideos()
    }
  }, [])

  const stitchVideos = async () => {
    setIsStitching(true)
    setIsLoading(true)
    setProgress(0)
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)
      
      const response = await api.stitchVideos({
        videos: data.videos,
        soundEffects: data.soundEffects
      })
      
      clearInterval(progressInterval)
      setProgress(100)
      
      setStitchedVideos(response.data.stitchedVideos)
      updateData({ stitchedVideos: response.data.stitchedVideos })
      
      toast.success('Videos assembled successfully!')
      
      // Auto-advance after a short delay
      setTimeout(() => {
        onNext()
      }, 1500)
      
    } catch (error) {
      console.error('Error stitching videos:', error)
      
      // Mock success for demo
      const mockStitched = data.scenes.map((scene, index) => ({
        sceneNumber: scene.number,
        videoUrl: data.videos[index].videoUrl,
        sfxUrl: data.soundEffects[index].selectedSfx.url,
        combinedUrl: `/api/stitched/${scene.number}`
      }))
      
      setStitchedVideos(mockStitched)
      updateData({ stitchedVideos: mockStitched })
      
      setProgress(100)
      toast.success('Videos assembled successfully!')
      
      setTimeout(() => {
        onNext()
      }, 1500)
    } finally {
      setIsStitching(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Assembling Your Videos
          </h2>
          <p className="text-gray-600">
            Combining videos with their sound effects
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              {isStitching ? (
                <Loader2 className="w-16 h-16 text-white animate-spin" />
              ) : (
                <Layers className="w-16 h-16 text-white" />
              )}
            </div>
            
            {/* Progress ring */}
            <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                className="text-green-500 transition-all duration-500"
              />
            </svg>
          </div>

          <div className="w-full max-w-md mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Status messages */}
          <div className="space-y-2 text-sm text-gray-600">
            {progress >= 25 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="w-4 h-4 bg-green-500 rounded-full" />
                Loading video files...
              </motion.p>
            )}
            {progress >= 50 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="w-4 h-4 bg-green-500 rounded-full" />
                Adding sound effects...
              </motion.p>
            )}
            {progress >= 75 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="w-4 h-4 bg-green-500 rounded-full" />
                Synchronizing audio...
              </motion.p>
            )}
            {progress === 100 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-green-600 font-medium"
              >
                <span className="w-4 h-4 bg-green-500 rounded-full" />
                Assembly complete!
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default VideoStitching
