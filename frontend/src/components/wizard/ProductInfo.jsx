import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertCircle, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ProductInfo = ({ data, updateData, onNext }) => {
  const [errors, setErrors] = useState({})
  const [isEnhancing, setIsEnhancing] = useState(false)
  
  const [formData, setFormData] = useState({
    productIdea: data.productIdea || '',
    mood: data.mood || 'Professional',
    targetAudience: data.targetAudience || 'Young Professionals'
  })

  // Example product ideas
  const exampleIdeas = [
    "A smart water bottle that tracks hydration and reminds you to drink water",
    "An eco-friendly food delivery service using only electric vehicles",
    "A mobile app that helps people find and join local community events",
    "A subscription box service for exotic cooking ingredients from around the world"
  ]

  // Available moods
  const moods = [
    'Energetic', 'Nostalgic', 'Quirky', 'Professional', 
    'Emotional', 'Humorous', 'Dramatic', 'Inspirational'
  ]

  // Target audience options
  const audienceOptions = [
    'Young Professionals',
    'Parents with Young Children',
    'Health-Conscious Adults',
    'Tech Enthusiasts',
    'Small Business Owners',
    'Students',
    'Seniors (65+)',
    'Eco-Conscious Consumers',
    'Luxury Shoppers',
    'Budget-Conscious Families'
  ]

  const handleIdeaChange = (value) => {
    setFormData(prev => ({ ...prev, productIdea: value }))
    if (errors.productIdea) {
      setErrors(prev => ({ ...prev, productIdea: '' }))
    }
  }

  const handleExampleClick = (example) => {
    handleIdeaChange(example)
  }

  const handleEnhanceWithAI = async () => {
    if (!formData.productIdea.trim()) {
      toast.error('Please enter a product idea first')
      return
    }

    setIsEnhancing(true)
    
    // Log what we're sending
    console.log('=== Enhance with AI Request ===')
    console.log('Original idea:', formData.productIdea)
    console.log('Mood:', formData.mood)
    console.log('Audience:', formData.targetAudience)
    console.log('API endpoint:', '/api/enhance-product-idea')
    
    try {
      const requestData = {
        idea: formData.productIdea,
        mood: formData.mood,
        audience: formData.targetAudience
      }
      
      console.log('Sending request:', requestData)
      
      const response = await api.enhanceProductIdea(requestData)
      
      console.log('=== API Response ===')
      console.log('Full response:', response)
      console.log('Enhanced idea:', response.data.enhancedIdea)
      console.log('Warning (if any):', response.data.warning)
      
      if (response.data.enhancedIdea) {
        // Store the original for comparison
        const originalIdea = formData.productIdea
        
        handleIdeaChange(response.data.enhancedIdea)
        
        // Show the transformation in console
        console.log('=== Transformation ===')
        console.log('Before:', originalIdea)
        console.log('After:', response.data.enhancedIdea)
        
        // Check if it's actually enhanced or just a fallback
        if (response.data.warning) {
          // react-hot-toast doesn't have warning, use custom toast
          toast('Enhanced with fallback (check if backend is running)', {
            icon: '⚠️',
            style: {
              background: '#FEF3C7',
              color: '#92400E',
            },
          })
        } else {
          toast.success('Product idea enhanced with AI!')
        }
      }
    } catch (error) {
      console.error('=== Enhancement Error ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response)
      
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
      
      toast.error('Failed to enhance idea. Check console for details.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.productIdea.trim()) {
      newErrors.productIdea = 'Product idea is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validate()) {
      // Extract product name and key message from the idea
      const lines = formData.productIdea.split('.').filter(l => l.trim())
      const productName = lines[0]?.trim().split(' ').slice(0, 3).join(' ') || 'Product'
      const keyMessage = lines.slice(1).join('. ').trim() || formData.productIdea
      
      updateData({
        productName,
        productIdea: formData.productIdea,
        keyMessage,
        mood: formData.mood,
        targetAudience: formData.targetAudience
      })
      onNext()
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Let's Create Your Commercial
            </h2>
            <p className="text-gray-600">
              Start with your product idea, then customize the style and audience
            </p>
          </div>

          {/* Product Idea Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Describe your product or idea
            </h3>
            
            {/* Product Idea Textarea */}
            <div className="relative mb-4">
              <textarea
                value={formData.productIdea}
                onChange={(e) => handleIdeaChange(e.target.value)}
                placeholder="Try something vague like: 'something for productivity' or 'help people sleep'"
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border bg-white ${
                  errors.productIdea ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none`}
              />
              {errors.productIdea && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.productIdea}
                </p>
              )}
            </div>

            {/* Example Ideas */}
            <details className="group">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition-colors mb-3">
                Need inspiration? Click for example ideas
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {exampleIdeas.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-left px-4 py-3 bg-white hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors border border-gray-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Style Settings Section */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Step 2: Customize your commercial
            </h3>

            {/* Mood Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Choose a mood
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.mood === mood
                        ? 'bg-black text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience Dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Select your target audience
              </label>
              <div className="relative">
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white"
                >
                  {audienceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* AI Enhancement Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Want AI to enhance your idea?
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Our AI can transform vague concepts into compelling product descriptions
              </p>
              <button
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancing || !formData.productIdea.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enhancing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Enhance with AI
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Works best with simple ideas like "something for fitness" or "make cooking easier"
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-6 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 text-lg shadow-lg hover:shadow-xl"
            >
              Create My Commercial →
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ProductInfo
