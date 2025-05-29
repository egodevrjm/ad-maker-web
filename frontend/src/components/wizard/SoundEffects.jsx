import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Music, Volume2, Play, Pause, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const SoundEffects = ({ data, updateData, onNext, setIsLoading }) => {
  const [soundEffects, setSoundEffects] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [playingIndex, setPlayingIndex] = useState(null)
  const [selectedSfx, setSelectedSfx] = useState({})
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    if (soundEffects.length === 0 && data.scenes.length > 0) {
      generateSoundEffects()
    }
  }, [])

  const generateSoundEffects = async () => {
    setIsGenerating(true)
    setIsLoading(true)
    setUsingMockData(false)
    
    try {
      console.log('Generating sound effects for scenes:', data.scenes.map(s => ({
        number: s.number,
        prompt: s.sfxPrompt
      })))
      
      const sfxPromises = data.scenes.map(async (scene) => {
        console.log(`Calling API for scene ${scene.number}:`, scene.sfxPrompt)
        
        const response = await api.generateSoundEffect({
          prompt: scene.sfxPrompt,
          duration: scene.duration,
          sceneNumber: scene.number
        })
        
        console.log(`Response for scene ${scene.number}:`, response.data)
        
        return {
          sceneNumber: scene.number,
          options: response.data.soundEffects // Array of 4 options
        }
      })
      
      const generatedSfx = await Promise.all(sfxPromises)
      setSoundEffects(generatedSfx)
      
      // Auto-select first option for each scene
      const autoSelected = {}
      generatedSfx.forEach(sfx => {
        autoSelected[sfx.sceneNumber] = 0
      })
      setSelectedSfx(autoSelected)
      
      // Check if we got real data
      const hasRealUrls = generatedSfx.some(sfx => 
        sfx.options.some(opt => opt.url && !opt.url.includes('mock'))
      )
      
      if (!hasRealUrls) {
        setUsingMockData(true)
        toast.info('Using mock sound effects for demo')
      } else {
        toast.success('Sound effects generated!')
      }
    } catch (error) {
      console.error('Error generating sound effects:', error)
      
      // Mock data fallback
      const mockSfx = data.scenes.map(scene => ({
        sceneNumber: scene.number,
        options: [
          { id: 'sfx1', url: `/api/mock-sfx/${scene.number}-1.mp3`, name: 'Upbeat' },
          { id: 'sfx2', url: `/api/mock-sfx/${scene.number}-2.mp3`, name: 'Energetic' },
          { id: 'sfx3', url: `/api/mock-sfx/${scene.number}-3.mp3`, name: 'Calm' },
          { id: 'sfx4', url: `/api/mock-sfx/${scene.number}-4.mp3`, name: 'Dramatic' }
        ]
      }))
      
      setSoundEffects(mockSfx)
      setUsingMockData(true)
      
      const autoSelected = {}
      mockSfx.forEach(sfx => {
        autoSelected[sfx.sceneNumber] = 0
      })
      setSelectedSfx(autoSelected)
      
      toast.warning('Using mock sound effects (ElevenLabs not configured or failed)')
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  const handlePlayPause = (sceneNumber, optionIndex) => {
    const audioId = `audio-${sceneNumber}-${optionIndex}`
    const audio = document.getElementById(audioId)
    
    if (!audio) {
      console.error(`Audio element not found: ${audioId}`)
      toast.error('Audio not found')
      return
    }
    
    console.log(`Playing audio: ${audio.src}`)
    
    if (playingIndex === audioId) {
      audio.pause()
      setPlayingIndex(null)
    } else {
      // Pause any currently playing audio
      if (playingIndex) {
        const currentAudio = document.getElementById(playingIndex)
        if (currentAudio) currentAudio.pause()
      }
      
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        toast.error('Failed to play audio - check browser console')
      })
      setPlayingIndex(audioId)
    }
  }

  const handleSelectSfx = (sceneNumber, optionIndex) => {
    setSelectedSfx(prev => ({
      ...prev,
      [sceneNumber]: optionIndex
    }))
  }

  const handleContinue = () => {
    const selectedSoundEffects = soundEffects.map(sfx => ({
      sceneNumber: sfx.sceneNumber,
      selectedSfx: sfx.options[selectedSfx[sfx.sceneNumber]]
    }))
    
    updateData({ soundEffects: selectedSoundEffects })
    onNext()
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
            Sound Effects Selection
          </h2>
          <p className="text-gray-600">
            Choose the perfect sound effects for each scene
          </p>
          
          {/* Status Indicator */}
          {usingMockData && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  Using mock sound effects for demo. To enable real sound generation:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                  <li>Add ELEVENLABS_API_KEY to your backend .env file</li>
                  <li>Ensure your ElevenLabs account has sound effects access (beta feature)</li>
                  <li>Mock sounds are simple beep tones at different frequencies</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {isGenerating ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
              <Music className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generating sound effects...
            </h3>
            <p className="text-gray-600 mb-4">
              Creating multiple options for each scene
            </p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : (
          <>
            {/* SFX Selection for each scene */}
            <div className="space-y-8 mb-8">
              {soundEffects.map((sfx, sceneIndex) => (
                <motion.div
                  key={sfx.sceneNumber}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: sceneIndex * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Scene {sfx.sceneNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {data.scenes[sceneIndex]?.sfxPrompt}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {sfx.options.map((option, optionIndex) => (
                      <div
                        key={option.id || optionIndex}
                        className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedSfx[sfx.sceneNumber] === optionIndex
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectSfx(sfx.sceneNumber, optionIndex)}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white mb-2">
                            <Volume2 className="w-6 h-6" />
                          </div>
                          
                          <span className="text-sm font-medium text-gray-900 mb-2">
                            {option.name}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePlayPause(sfx.sceneNumber, optionIndex)
                            }}
                            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                            title={`Play ${option.name} sound effect`}
                          >
                            {playingIndex === `audio-${sfx.sceneNumber}-${optionIndex}` ? (
                              <Pause className="w-4 h-4 text-gray-700" />
                            ) : (
                              <Play className="w-4 h-4 text-gray-700 ml-0.5" />
                            )}
                          </button>
                          
                          <audio
                            id={`audio-${sfx.sceneNumber}-${optionIndex}`}
                            src={option.url}
                            onEnded={() => setPlayingIndex(null)}
                            onError={(e) => {
                              console.error(`Audio error for ${option.url}:`, e)
                            }}
                            preload="none"
                          />
                        </div>
                        
                        {selectedSfx[sfx.sceneNumber] === optionIndex && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={generateSoundEffects}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate All
              </button>
              
              <button
                onClick={handleContinue}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Continue to Video Assembly
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default SoundEffects
