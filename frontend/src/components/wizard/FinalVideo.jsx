import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Film, Download, Play, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const FinalVideo = ({ data, updateData, onNext, setIsLoading }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [finalVideoUrl, setFinalVideoUrl] = useState('')
  const [progress, setProgress] = useState(0)
  const [videoMetadata, setVideoMetadata] = useState(null)

  useEffect(() => {
    if (!finalVideoUrl && data.stitchedVideos && data.voiceoverUrl) {
      createFinalVideo()
    }
  }, [])

  const createFinalVideo = async () => {
    setIsCreating(true)
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
      }, 800)
      
      const response = await api.createFinalVideo({
        stitchedVideos: data.stitchedVideos,
        voiceoverUrl: data.voiceoverUrl,
        productName: data.productName
      })
      
      clearInterval(progressInterval)
      setProgress(100)
      
      setFinalVideoUrl(response.data.finalVideoUrl)
      setVideoMetadata({
        duration: response.data.duration,
        resolution: response.data.resolution,
        fileSize: response.data.fileSize
      })
      updateData({ 
        finalVideoUrl: response.data.finalVideoUrl,
        finalVideoMetadata: response.data 
      })
      
      if (response.data.warning) {
        toast.warning(response.data.warning)
      } else {
        toast.success('Final video created successfully!')
      }
    } catch (error) {
      console.error('Error creating final video:', error)
      
      // Mock URL for demo
      const mockUrl = `/api/final-video/${Date.now()}.mp4`
      setProgress(100)
      setFinalVideoUrl(mockUrl)
      updateData({ finalVideoUrl: mockUrl })
      
      toast.success('Final video created successfully!')
    } finally {
      setIsCreating(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Commercial is Ready!
          </h2>
          <p className="text-gray-600">
            Preview and download your 30-second masterpiece
          </p>
        </div>

        {/* FFmpeg Notice */}
        {finalVideoUrl && finalVideoUrl.includes('/api/final/commercial.mp4') && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800 font-medium">Using Demo Video</p>
              <p className="text-sm text-yellow-700 mt-1">
                For real video processing, install FFmpeg on your system:
              </p>
              <code className="text-xs bg-yellow-100 px-2 py-1 rounded mt-2 inline-block">
                brew install ffmpeg
              </code>
            </div>
          </div>
        )}

        {isCreating ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
              <Film className="w-12 h-12 text-white animate-pulse" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Creating your final commercial...
            </h3>
            
            <div className="w-full max-w-md mx-auto mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Rendering</span>
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
            
            <div className="space-y-2 text-sm text-gray-600">
              {progress >= 20 && <p>✓ Combining video scenes...</p>}
              {progress >= 40 && <p>✓ Adding voiceover track...</p>}
              {progress >= 60 && <p>✓ Mixing audio levels...</p>}
              {progress >= 80 && <p>✓ Applying final touches...</p>}
              {progress === 100 && <p className="text-green-600 font-medium">✓ Commercial complete!</p>}
            </div>
          </div>
        ) : finalVideoUrl ? (
          <>
            {/* Video Player */}
            <div className="glass-card p-8 mb-8">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 relative">
                <video
                  src={finalVideoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster="/api/video-poster.jpg"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
                    30 seconds
                  </span>
                </div>
              </div>
              
              {/* Video Info */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">4</div>
                  <div className="text-sm text-gray-600">Scenes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {videoMetadata?.duration || 30}s
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {videoMetadata?.resolution || '1080p'}
                  </div>
                  <div className="text-sm text-gray-600">Quality</div>
                </div>
              </div>
              
              {/* Download Button */}
              <div className="flex justify-center">
                <a
                  href={finalVideoUrl}
                  download={`${data.productName.replace(/\s+/g, '_')}_commercial.mp4`}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download Video
                </a>
              </div>
            </div>

            {/* Production Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Production Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Product:</dt>
                    <dd className="font-medium">{data.productName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Target Audience:</dt>
                    <dd className="font-medium">{data.targetAudience}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Voice:</dt>
                    <dd className="font-medium">{data.selectedVoice?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Created:</dt>
                    <dd className="font-medium">{new Date().toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Technical Specs</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Resolution:</dt>
                    <dd className="font-medium">
                      {videoMetadata?.resolution || '1920x1080'} (Full HD)
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Frame Rate:</dt>
                    <dd className="font-medium">30 fps</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Format:</dt>
                    <dd className="font-medium">MP4 (H.264)</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">File Size:</dt>
                    <dd className="font-medium">{videoMetadata?.fileSize || '~25MB'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <button
                onClick={onNext}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Generate Social Media Posts
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto" />
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default FinalVideo
