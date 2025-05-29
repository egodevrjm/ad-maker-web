import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for auth tokens if needed
apiClient.interceptors.request.use(
  config => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// API methods
const api = {
  // Script Generation
  generateScript: (data) => {
    return apiClient.post('/generate-script', data)
  },

  // Enhance Product Idea with AI
  enhanceProductIdea: (data) => {
    return apiClient.post('/enhance-product-idea', data)
  },

  // Video Generation
  generateVideo: (sceneData) => {
    return apiClient.post('/generate-video', sceneData)
  },

  // Sound Effects
  generateSoundEffect: (sfxData) => {
    return apiClient.post('/generate-sfx', sfxData)
  },

  // Voice Over
  listVoices: () => {
    return apiClient.get('/voices')
  },

  generateVoiceover: (voiceData) => {
    return apiClient.post('/generate-voiceover', voiceData)
  },

  // Video Processing
  stitchVideos: (videoData) => {
    return apiClient.post('/stitch-videos', videoData)
  },

  createFinalVideo: (finalData) => {
    return apiClient.post('/create-final-video', finalData)
  },

  // Social Posts
  generateSocialPosts: (productData) => {
    return apiClient.post('/generate-social-posts', productData)
  },

  // File Upload
  uploadFile: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      }
    })
  },

  // Check API status
  checkStatus: () => {
    return apiClient.get('/status')
  }
}

export default api
