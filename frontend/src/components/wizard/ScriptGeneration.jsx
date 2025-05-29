import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Film, Music, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ScriptGeneration = ({ data, updateData, onNext, setIsLoading }) => {
  const [scenes, setScenes] = useState(data.scenes || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedScene, setSelectedScene] = useState(0)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  useEffect(() => {
    if (scenes.length === 0 && !isGenerating) {
      generateScript()
    }
  }, [])

  const generateScript = async () => {
    setIsGenerating(true)
    setIsLoading(true)
    setIsUsingFallback(false)
    
    console.log('=== Script Generation Request ===')
    console.log('Product Name:', data.productName)
    console.log('Target Audience:', data.targetAudience)
    console.log('Key Message:', data.keyMessage)
    console.log('Mood:', data.mood)
    
    try {
      const requestData = {
        productName: data.productName,
        targetAudience: data.targetAudience,
        keyMessage: data.keyMessage,
        mood: data.mood || 'Professional'
      }
      
      console.log('Sending to API:', requestData)
      
      const response = await api.generateScript(requestData)
      
      console.log('=== API Response ===')
      console.log('Response:', response)
      console.log('Scenes:', response.data.scenes)
      console.log('Warning:', response.data.warning)
      
      // Check if we got real AI-generated content or fallback
      if (response.data.warning) {
        setIsUsingFallback(true)
        toast('Using fallback script (check backend logs)', {
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        })
      } else {
        // Check if the scenes look generic
        const firstScript = response.data.scenes[0]?.script || ''
        if (firstScript.includes('face unique challenges') || 
            firstScript.includes('fast-paced world')) {
          console.warn('Scenes look like generic fallback content!')
          setIsUsingFallback(true)
        }
      }
      
      setScenes(response.data.scenes)
      updateData({ scenes: response.data.scenes })
      
      if (!response.data.warning) {
        toast.success('Script generated with AI!')
      }
    } catch (error) {
      console.error('=== Script Generation Error ===')
      console.error('Error:', error)
      toast.error('Failed to generate script. Using creative fallback.')
      
      // Create dynamic mock scenes based on the actual product
      const dynamicMockScenes = createDynamicScenes(
        data.productName,
        data.targetAudience,
        data.keyMessage,
        data.mood
      )
      
      setScenes(dynamicMockScenes)
      updateData({ scenes: dynamicMockScenes })
      setIsUsingFallback(true)
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  const createDynamicScenes = (productName, audience, keyMessage, mood) => {
    // Create more specific scenes based on the actual product
    const moodStyles = {
      'Energetic': { opening: 'Fast-paced montage', music: 'High-energy electronic' },
      'Nostalgic': { opening: 'Vintage filter scene', music: 'Warm orchestral' },
      'Quirky': { opening: 'Unexpected angle', music: 'Playful and offbeat' },
      'Professional': { opening: 'Clean corporate', music: 'Sophisticated ambient' },
      'Emotional': { opening: 'Close-up human moments', music: 'Touching piano' },
      'Humorous': { opening: 'Comedy setup', music: 'Light and bouncy' },
      'Dramatic': { opening: 'Cinematic wide shot', music: 'Epic orchestral' },
      'Inspirational': { opening: 'Sunrise or achievement', music: 'Uplifting symphony' }
    }
    
    const style = moodStyles[mood] || moodStyles['Professional']
    
    return [
      {
        number: 1,
        duration: 7.5,
        script: `${style.opening}: ${audience} in their element, showcasing the need for ${productName}`,
        videoPrompt: `${mood} opening - Show ${audience} in realistic situations that highlight why they need this solution, ${style.opening} style`,
        sfxPrompt: `${style.music} music starting softly, building anticipation`
      },
      {
        number: 2,
        duration: 7.5,
        script: `Introducing ${productName} - ${keyMessage}`,
        videoPrompt: `Product reveal with ${mood.toLowerCase()} style - Show the product in action, highlighting unique features that deliver on "${keyMessage}"`,
        sfxPrompt: `Music shifts to ${mood.toLowerCase()} tone, product interaction sounds`
      },
      {
        number: 3,
        duration: 7.5,
        script: `Watch how ${productName} transforms the experience for ${audience}`,
        videoPrompt: `Success montage - ${audience} using ${productName} with visible positive results, ${mood.toLowerCase()} visual style`,
        sfxPrompt: `${style.music} reaching emotional peak, success sound effects`
      },
      {
        number: 4,
        duration: 7.5,
        script: `${productName} - ${keyMessage}. Start your journey today!`,
        videoPrompt: `${mood} closing - Strong call to action, logo animation, website/app display, special offer highlight`,
        sfxPrompt: `${style.music} memorable ending, brand sound signature`
      }
    ]
  }

  const handleEditScene = (index, field, value) => {
    const updatedScenes = [...scenes]
    updatedScenes[index][field] = value
    setScenes(updatedScenes)
    updateData({ scenes: updatedScenes })
  }

  const handleContinue = () => {
    if (scenes.length === 0) {
      toast.error('Please generate a script first')
      return
    }
    onNext()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              AI Script Generation
            </h2>
            <p className="text-gray-600">
              Google Gemini will create a compelling 30-second commercial script
            </p>
          </div>
          
          {scenes.length > 0 && (
            <button
              onClick={generateScript}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          )}
        </div>

        {/* Warning if using fallback */}
        {isUsingFallback && scenes.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Using fallback script</p>
              <p className="text-sm text-yellow-700">Check if GOOGLE_API_KEY is configured and Gemini API is working</p>
            </div>
          </div>
        )}

        {isGenerating && scenes.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generating your script...
            </h3>
            <p className="text-gray-600 mb-4">
              AI is crafting the perfect {data.mood?.toLowerCase() || 'professional'} commercial for {data.productName}
            </p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : (
          <>
            {/* Scene Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
              {scenes.map((scene, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedScene(index)}
                  className={`px-4 py-2 font-medium transition-all ${
                    selectedScene === index
                      ? 'text-brand-600 border-b-2 border-brand-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Scene {scene.number}
                </button>
              ))}
            </div>

            {/* Scene Content */}
            {scenes[selectedScene] && (
              <motion.div
                key={selectedScene}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scene {scenes[selectedScene].number} • {scenes[selectedScene].duration}s
                    </h3>
                    <span className="text-sm text-gray-600">
                      {((selectedScene + 1) / scenes.length * 100).toFixed(0)}% of commercial
                    </span>
                  </div>

                  {/* Script */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Film className="w-4 h-4" />
                      Scene Description / Voiceover
                    </label>
                    <textarea
                      value={scenes[selectedScene].script}
                      onChange={(e) => handleEditScene(selectedScene, 'script', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Video Prompt */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Film className="w-4 h-4" />
                      Video Generation Prompt
                    </label>
                    <textarea
                      value={scenes[selectedScene].videoPrompt}
                      onChange={(e) => handleEditScene(selectedScene, 'videoPrompt', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* SFX Prompt */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Music className="w-4 h-4" />
                      Sound Effects Prompt
                    </label>
                    <textarea
                      value={scenes[selectedScene].sfxPrompt}
                      onChange={(e) => handleEditScene(selectedScene, 'sfxPrompt', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Timeline Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Timeline Preview</h4>
                  <div className="flex space-x-1">
                    {scenes.map((scene, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-2 rounded ${
                          index === selectedScene
                            ? 'bg-brand-600'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>0s</span>
                    <span>30s</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            <div className="mt-8 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <Check className="w-4 h-4 inline mr-1 text-green-600" />
                All scenes ready for video generation
              </p>
              
              <button
                onClick={handleContinue}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Continue to Video Generation
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default ScriptGeneration
