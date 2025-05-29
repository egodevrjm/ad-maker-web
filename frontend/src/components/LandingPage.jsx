import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Video, Mic, Share2, ArrowRight, Zap, Clock, Target } from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Script Generation",
      description: "Google Gemini creates engaging scripts tailored to your product"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Video Creation",
      description: "Generate stunning videos with FAL.ai's advanced AI"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice & Sound",
      description: "Professional voiceovers and sound effects with ElevenLabs"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Social Ready",
      description: "Get optimized posts for Twitter/X and LinkedIn"
    }
  ]

  const benefits = [
    {
      icon: <Clock className="w-5 h-5" />,
      text: "30-second commercials in minutes, not days"
    },
    {
      icon: <Target className="w-5 h-5" />,
      text: "Perfectly targeted to your audience"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: "Professional quality with AI efficiency"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Create Stunning Ads
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                in Minutes with AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Transform your product into a professional 30-second commercial using the power of Google Gemini, FAL.ai, and ElevenLabs
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
                >
                  Start Creating
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-6 justify-center text-white/80 text-sm">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  {benefit.icon}
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Create Amazing Ads
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered wizard guides you through every step of creating professional commercials
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 hover:transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Create your commercial in 8 simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: 1, title: "Product Info", desc: "Tell us about your product" },
            { step: 2, title: "AI Script", desc: "Gemini creates your script" },
            { step: 3, title: "Video Gen", desc: "AI generates video scenes" },
            { step: 4, title: "Sound Design", desc: "Add effects and music" },
            { step: 5, title: "Voice Over", desc: "Professional narration" },
            { step: 6, title: "Final Edit", desc: "Everything comes together" },
            { step: 7, title: "Social Posts", desc: "Ready-to-share content" },
            { step: 8, title: "Export", desc: "Download your commercial" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-card p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Create Your First AI Commercial?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators who are revolutionizing video advertising
          </p>
          <Link to="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto group"
            >
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage
