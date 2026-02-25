import axios from 'axios'

// API base URL - change this for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for ML operations
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Health check endpoint
 */
export const checkHealth = async () => {
  const response = await api.get('/health')
  return response.data
}

/**
 * Predict class from uploaded image file
 * @param {File} file - Image file to classify
 */
export const predictFromFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Predict class from base64 image
 * @param {string} imageBase64 - Base64 encoded image
 */
export const predictFromBase64 = async (imageBase64) => {
  const response = await api.post('/predict/base64', {
    image: imageBase64,
  })
  return response.data
}

/**
 * Get all layer information
 */
export const getLayers = async () => {
  const response = await api.get('/layers')
  return response.data
}

/**
 * Get specific layer information
 * @param {string} layerName - Name of the layer
 */
export const getLayerInfo = async (layerName) => {
  const response = await api.get(`/layers/${layerName}`)
  return response.data
}

/**
 * Get activation for specific layer
 * @param {string} layerName - Name of the layer
 * @param {File} file - Image file
 */
export const getLayerActivation = async (layerName, file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post(`/activations/${layerName}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Compute Grad-CAM from file
 * @param {File} file - Image file
 * @param {number|null} targetClass - Target class index (optional)
 * @param {number} alpha - Overlay alpha value
 */
export const computeGradCAM = async (file, targetClass = null, alpha = 0.5) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const params = new URLSearchParams()
  if (targetClass !== null) {
    params.append('target_class', targetClass)
  }
  params.append('alpha', alpha)
  
  const response = await api.post(`/gradcam?${params.toString()}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Compute Grad-CAM from base64
 * @param {string} imageBase64 - Base64 encoded image
 * @param {number|null} targetClass - Target class index (optional)
 * @param {number} alpha - Overlay alpha value
 */
export const computeGradCAMBase64 = async (imageBase64, targetClass = null, alpha = 0.5) => {
  const response = await api.post('/gradcam/base64', {
    image: imageBase64,
    target_class: targetClass,
    alpha: alpha,
  })
  return response.data
}

/**
 * Get filter weights visualization
 * @param {string} layerName - Convolutional layer name
 */
export const getFilterWeights = async (layerName) => {
  const response = await api.get(`/filters/${layerName}`)
  return response.data
}

/**
 * Get model architecture information
 */
export const getArchitecture = async () => {
  const response = await api.get('/architecture')
  return response.data
}

export default api
