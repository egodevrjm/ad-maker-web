import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Play, Pause, RefreshCw, User, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const VoiceOver = ({ data, updateData, onNext, setIsLoading }) => {
  const [voiceoverScript, setVoiceoverScript] = useState(data.voiceoverScript || '')
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [voiceoverUrl, setVoiceoverUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewingVoice, setPreviewingVoice] = useState(null)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)

  useEffect(() => {
    loadVoices()
    if (!voiceoverScript) {
      generateScript()
    }
  }, [])

  const loadVoices = async () => {
    try {
      const response = await api.listVoices()
      console.log('Loaded voices:', response.data.voices)
      setVoices(response.data.voices)
      if (response.data.voices.length > 0) {
        setSelectedVoice(response.data.voices[0])
      }
      
      if (response.data.warning) {
        toast.info(response.data.warning)
      }
    } catch (error) {
      console.error('Error loading voices:', error)
      // Mock voices for demo
      const mockVoices = [
        { id: 'rachel', name: 'Rachel', description: 'American, young adult female' },
        { id: 'adam', name: 'Adam', description: 'American, middle-aged male' },
        { id: 'nicole', name: 'Nicole', description: 'British, young adult female' },
        { id: 'daniel', name: 'Daniel', description: 'British, middle-aged male' }
      ]
      setVoices(mockVoices)
      setSelectedVoice(mockVoices[0])
      toast.warning('Using demo voices - check ElevenLabs API configuration')
    }
  }

  const generateScript = async () => {
    setIsGeneratingScript(true)
    setIsLoading(true)
    
    try {
      // Create a comprehensive prompt with all context
      const sceneDescriptions = data.scenes?.map(scene => 
        `Scene ${scene.number}: ${scene.script}`
      ).join('\n') || '';
      
      const response = await api.generateScript({
        productName: data.productName,
        targetAudience: data.targetAudience,
        keyMessage: data.keyMessage,
        scenes: data.scenes,
        type: 'voiceover',
        context: `Create a 30-second voiceover script for a commercial with these scenes:\n${sceneDescriptions}`
      })
      
      setVoiceoverScript(response.data.voiceoverScript)
      toast.success('Voiceover script generated!')
    } catch (error) {
      console.error('Script generation error:', error)
      
      // Generate contextual mock script based on scenes
      let mockScript = `In a world where ${data.targetAudience} face daily challenges...\n\n`
      
      if (data.scenes && data.scenes.length > 0) {
        // Use actual scene content if available
        mockScript = data.scenes.map(scene => scene.script).join('\n\n')
      } else {
        // Fallback to template
        mockScript = `Are you tired of feeling overwhelmed by endless tasks and deadlines?

Introducing ${data.productName} - the revolutionary solution designed specifically for ${data.targetAudience}.

${data.keyMessage}

Transform your workflow, reclaim your time, and achieve more than you ever thought possible.

Join thousands who've already discovered the power of ${data.productName}.

Visit our website today and get 20% off your first month.

${data.productName} - because your time matters.`
      }
      
      setVoiceoverScript(mockScript)
      toast.info('Generated voiceover script from scene content')
    } finally {
      setIsGeneratingScript(false)
      setIsLoading(false)
    }
  }

  const generateVoiceover = async () => {
    if (!selectedVoice || !voiceoverScript) {
      toast.error('Please select a voice and ensure script is ready')
      return
    }
    
    setIsGenerating(true)
    setIsLoading(true)
    
    try {
      console.log('Generating voiceover with:', {
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        textLength: voiceoverScript.length
      })
      
      const response = await api.generateVoiceover({
        text: voiceoverScript,
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name
      })
      
      console.log('Voiceover response:', response.data)
      
      setVoiceoverUrl(response.data.audioUrl)
      updateData({
        voiceoverScript,
        voiceoverUrl: response.data.audioUrl,
        selectedVoice,
        voiceoverDuration: response.data.duration,
        voiceoverFileSize: response.data.fileSize
      })
      
      if (response.data.warning) {
        toast.info(`Voiceover generated (${response.data.warning})`)
      } else if (response.data.status === 'error') {
        toast.warning('Using fallback audio - check API configuration')
      } else {
        toast.success('Voiceover generated successfully!')
      }
    } catch (error) {
      console.error('Voiceover generation error:', error)
      
      // Handle different error types
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Invalid ElevenLabs API key')
        } else if (error.response.status === 429) {
          toast.error('Rate limit exceeded or insufficient credits')
        } else {
          toast.error(error.response.data.error || 'Failed to generate voiceover')
        }
      } else {
        toast.error('Network error - check your connection')
      }
      
      // Use fallback
      const mockUrl = `/api/mock-voiceover/final.mp3`
      setVoiceoverUrl(mockUrl)
      updateData({
        voiceoverScript,
        voiceoverUrl: mockUrl,
        selectedVoice
      })
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  const handlePlayPause = () => {
    const audio = document.getElementById('voiceover-audio')
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const previewVoice = async (voice) => {
    if (previewingVoice === voice.id) {
      // Stop preview
      const audio = document.getElementById(`preview-${voice.id}`)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setPreviewingVoice(null)
      return
    }
    
    setPreviewingVoice(voice.id)
    
    try {
      // Generate a short preview text
      const previewText = `Hi, I'm ${voice.name}. This is how I sound. Perfect for your commercial narration.`
      
      const response = await api.generateVoiceover({
        text: previewText,
        voiceId: voice.id,
        voiceName: voice.name
      })
      
      // Create audio element and play
      const audio = new Audio(response.data.audioUrl)
      audio.id = `preview-${voice.id}`
      audio.onended = () => setPreviewingVoice(null)
      audio.onerror = () => {
        toast.error('Failed to preview voice')
        setPreviewingVoice(null)
      }
      
      await audio.play()
    } catch (error) {
      console.error('Voice preview error:', error)
      toast.error('Failed to preview voice')
      setPreviewingVoice(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Voiceover Generation
          </h2>
          <p className="text-gray-600">
            Add professional narration to your commercial
          </p>
          
          {/* ElevenLabs Status Indicator */}
          {voiceoverUrl && voiceoverUrl.includes('mock') && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Using demo audio. For real voiceover, configure ElevenLabs API in backend.
              </span>
            </div>
          )}
          
          {voiceoverUrl && !voiceoverUrl.includes('mock') && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <Mic className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Using ElevenLabs AI voices for professional narration
              </span>
            </div>
          )}
        </div>

        {/* Script Editor */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Voiceover Script</h3>
            <div className="flex gap-2">
              {!voiceoverScript && (
                <button
                  onClick={generateScript}
                  disabled={isGeneratingScript}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm disabled:opacity-50"
                >
                  {isGeneratingScript ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Generate Script
                    </>
                  )}
                </button>
              )}
              {voiceoverScript && (
                <button
                  onClick={generateScript}
                  disabled={isGeneratingScript}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              )}
            </div>
          </div>
          
          <textarea
            value={voiceoverScript}
            onChange={(e) => setVoiceoverScript(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
            placeholder="Your voiceover script will appear here..."
          />
          
          <div className="mt-2 text-sm text-gray-600">
            Word count: {voiceoverScript ? voiceoverScript.split(/\s+/).filter(word => word.length > 0).length : 0} (aim for 75-80 words for 30 seconds)
          </div>
        </div>

        {/* Voice Selection */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Voice</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedVoice?.id === voice.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => setSelectedVoice(voice)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{voice.name}</h4>
                      <p className="text-sm text-gray-600">{voice.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => previewVoice(voice)}
                    disabled={previewingVoice !== null && previewingVoice !== voice.id}
                    className={`p-2 rounded-lg transition-all ${
                      previewingVoice === voice.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={previewingVoice === voice.id ? 'Stop preview' : 'Preview voice'}
                  >
                    {previewingVoice === voice.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {!voiceoverUrl && (
          <div className="text-center mb-6">
            <button
              onClick={generateVoiceover}
              disabled={isGenerating || !voiceoverScript || !selectedVoice}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                isGenerating || !voiceoverScript || !selectedVoice
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Mic className="w-5 h-5 animate-pulse" />
                  Generating Voiceover...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Generate Voiceover
                </span>
              )}
            </button>
          </div>
        )}

        {/* Audio Player */}
        {voiceoverUrl && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Preview Voiceover</h3>
              <button
                onClick={generateVoiceover}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-gray-700" />
                  ) : (
                    <Play className="w-6 h-6 text-gray-700 ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">
                    Voice: {selectedVoice?.name}
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div className="bg-brand-600 h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
              
              <audio
                id="voiceover-audio"
                src={voiceoverUrl}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={!voiceoverUrl}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              !voiceoverUrl
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
            }`}
          >
            Continue to Final Video
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default VoiceOver
