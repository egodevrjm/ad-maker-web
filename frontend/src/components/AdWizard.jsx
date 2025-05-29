import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Loader2, Save, RefreshCw } from 'lucide-react'
import { 
  saveWizardState, 
  loadWizardState, 
  clearWizardState,
  saveExpensiveData,
  loadExpensiveData,
  getSavedStateSummary
} from '../utils/stateManager'

// Import wizard steps
import ProductInfo from './wizard/ProductInfo'
import ScriptGeneration from './wizard/ScriptGeneration'
import VideoGeneration from './wizard/VideoGeneration'
import SoundEffects from './wizard/SoundEffects'
import VideoStitching from './wizard/VideoStitching'
import VoiceOver from './wizard/VoiceOver'
import FinalVideo from './wizard/FinalVideo'
import SocialPosts from './wizard/SocialPosts'

const AdWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasRestoredState, setHasRestoredState] = useState(false)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)
  
  // Commercial data state
  const [commercialData, setCommercialData] = useState({
    productName: '',
    targetAudience: '',
    keyMessage: '',
    scenes: [],
    voiceoverScript: '',
    voiceoverUrl: '',
    selectedVoice: null,
    finalVideoUrl: '',
    socialPosts: {
      twitter: '',
      linkedin: ''
    }
  })

  const steps = [
    { id: 1, name: 'Product Info', component: ProductInfo },
    { id: 2, name: 'Script Generation', component: ScriptGeneration },
    { id: 3, name: 'Video Creation', component: VideoGeneration },
    { id: 4, name: 'Sound Effects', component: SoundEffects },
    { id: 5, name: 'Video Assembly', component: VideoStitching },
    { id: 6, name: 'Voice Over', component: VoiceOver },
    { id: 7, name: 'Final Video', component: FinalVideo },
    { id: 8, name: 'Social Posts', component: SocialPosts }
  ]

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadWizardState()
    if (savedState && savedState.commercialData) {
      setCommercialData(savedState.commercialData)
      setCurrentStep(savedState.currentStep || 1)
      setHasRestoredState(true)
      toast.success(`Resumed from step ${savedState.currentStep}: ${steps[savedState.currentStep - 1].name}`)
      
      // Check for expensive data (videos)
      if (savedState.commercialData.productName) {
        const savedVideoData = loadExpensiveData('videos', savedState.commercialData.productName)
        if (savedVideoData && savedVideoData.videos) {
          setCommercialData(prev => ({ ...prev, videos: savedVideoData.videos }))
          toast.success('Restored previously generated videos')
        }
      }
    }
  }, [])

  // Auto-save state after each step change
  useEffect(() => {
    if (commercialData.productName) { // Only save if we have started
      saveWizardState({ commercialData }, currentStep)
      
      // Save expensive data for video generation step
      if (currentStep === 4 && commercialData.videos && commercialData.videos.length > 0) {
        saveExpensiveData('videos', commercialData.videos)
      }
      
      // Show save indicator
      setShowSaveIndicator(true)
      setTimeout(() => setShowSaveIndicator(false), 2000)
    }
  }, [currentStep, commercialData])

  const CurrentStepComponent = steps[currentStep - 1].component

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    toast.success('Commercial created successfully!')
    // Could redirect to a results page or download
  }

  const updateCommercialData = (data) => {
    setCommercialData(prev => ({ ...prev, ...data }))
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Ad Maker Wizard
            </h1>
            {hasRestoredState && (
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                Restored
              </span>
            )}
            {showSaveIndicator && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-sm text-blue-600"
              >
                <Save className="w-4 h-4" />
                Saved
              </motion.span>
            )}
          </div>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all saved progress?')) {
                clearWizardState()
                window.location.reload()
              }
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            title="Clear saved progress"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="relative">
                  <div
                    className={`wizard-step ${
                      currentStep === step.id
                        ? 'active'
                        : currentStep > step.id
                        ? 'completed'
                        : 'inactive'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-gray-600">{step.name}</span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-0.5 mx-2 transition-all duration-300 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{ minWidth: '50px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-8"
            >
              <CurrentStepComponent
                data={commercialData}
                updateData={updateCommercialData}
                onNext={handleNext}
                setIsLoading={setIsLoading}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1 || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdWizard
