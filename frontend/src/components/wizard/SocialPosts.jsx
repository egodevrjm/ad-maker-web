import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Twitter, Linkedin, Copy, Check, RefreshCw, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const SocialPosts = ({ data, updateData, onNext, setIsLoading }) => {
  const [socialPosts, setSocialPosts] = useState(data.socialPosts || { twitter: '', linkedin: '' })
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  useEffect(() => {
    if (!socialPosts.twitter || !socialPosts.linkedin) {
      generatePosts()
    }
  }, [])

  const generatePosts = async () => {
    setIsGenerating(true)
    setIsLoading(true)
    
    try {
      const response = await api.generateSocialPosts({
        productName: data.productName,
        targetAudience: data.targetAudience,
        keyMessage: data.keyMessage
      })
      
      setSocialPosts(response.data.posts)
      updateData({ socialPosts: response.data.posts })
      
      toast.success('Social posts generated!')
    } catch (error) {
      // Mock posts for demo
      const mockPosts = {
        twitter: `🚀 Introducing ${data.productName}! ${data.keyMessage} 

Perfect for ${data.targetAudience} who want to level up their productivity.

Watch our new commercial and get 20% off today! 

#Innovation #ProductivityHack #${data.productName.replace(/\s+/g, '')}`,
        
        linkedin: `Excited to announce the launch of ${data.productName}!

In today's fast-paced world, ${data.targetAudience} face unique challenges that demand innovative solutions. That's why we created ${data.productName} - a game-changing tool that delivers on a simple promise: ${data.keyMessage}

Our new commercial showcases the transformation that's possible when you have the right tools at your disposal. From overwhelming chaos to streamlined success, see how ${data.productName} is revolutionizing the way professionals work.

Key benefits:
✅ Save up to 10 hours per week
✅ Reduce stress and increase focus
✅ Achieve more with less effort
✅ Join a community of high achievers

Ready to transform your workflow? Watch our commercial and take advantage of our limited-time offer: 20% off your first month.

The future of productivity is here. Are you ready?

#ProductInnovation #BusinessTransformation #Productivity #TechForGood #${data.productName.replace(/\s+/g, '')}`
      }
      
      setSocialPosts(mockPosts)
      updateData({ socialPosts: mockPosts })
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copied to clipboard!')
      
      setTimeout(() => {
        setCopiedField(null)
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy text')
    }
  }

  const handleEditPost = (platform, value) => {
    setSocialPosts(prev => ({
      ...prev,
      [platform]: value
    }))
    updateData({
      socialPosts: {
        ...socialPosts,
        [platform]: value
      }
    })
  }

  const downloadAllAssets = () => {
    // In a real app, this would create a zip file with video + posts
    toast.success('Downloading all assets...')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Social Media Posts
          </h2>
          <p className="text-gray-600">
            Ready-to-share content for your commercial launch
          </p>
        </div>

        {isGenerating ? (
          <div className="text-center py-20">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="text-gray-600 mt-4">Crafting the perfect social posts...</p>
          </div>
        ) : (
          <>
            {/* Twitter/X Post */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Twitter/X</h3>
                    <p className="text-sm text-gray-600">
                      {socialPosts.twitter.length}/280 characters
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => copyToClipboard(socialPosts.twitter, 'twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copiedField === 'twitter' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy
                </button>
              </div>
              
              <textarea
                value={socialPosts.twitter}
                onChange={(e) => handleEditPost('twitter', e.target.value)}
                rows={5}
                maxLength={280}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
              />
            </motion.div>

            {/* LinkedIn Post */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="glass-card p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">LinkedIn</h3>
                    <p className="text-sm text-gray-600">Professional network post</p>
                  </div>
                </div>
                
                <button
                  onClick={() => copyToClipboard(socialPosts.linkedin, 'linkedin')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copiedField === 'linkedin' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy
                </button>
              </div>
              
              <textarea
                value={socialPosts.linkedin}
                onChange={(e) => handleEditPost('linkedin', e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
              />
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <button
                onClick={generatePosts}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Regenerate Posts
              </button>
              
              <div className="flex gap-4">
                <button
                  onClick={downloadAllAssets}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download All Assets
                </button>
                
                <button
                  onClick={onNext}
                  className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Project
                </button>
              </div>
            </div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your AI-generated commercial for {data.productName} is complete. 
                You now have a professional 30-second video and social media posts ready to launch your campaign!
              </p>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default SocialPosts
