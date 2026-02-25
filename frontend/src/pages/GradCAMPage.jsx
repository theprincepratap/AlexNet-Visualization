import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaFire, FaEye, FaInfoCircle } from 'react-icons/fa'

import ComparisonSlider from '../components/ComparisonSlider'
import { ExplanationCard } from '../components/TooltipExplanation'
import LoadingSpinner from '../components/LoadingSpinner'
import { computeGradCAM } from '../services/api'

function GradCAMPage({ uploadedImage, predictionResults }) {
  const navigate = useNavigate()
  const [gradcamData, setGradcamData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alpha, setAlpha] = useState(0.5)
  const [error, setError] = useState(null)

  // Redirect if no image
  useEffect(() => {
    if (!uploadedImage?.file && !predictionResults) {
      navigate('/')
    }
  }, [uploadedImage, predictionResults, navigate])

  // Fetch Grad-CAM on mount
  useEffect(() => {
    if (uploadedImage?.file && !gradcamData) {
      fetchGradCAM()
    }
  }, [uploadedImage])

  const fetchGradCAM = async (newAlpha = alpha) => {
    if (!uploadedImage?.file) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await computeGradCAM(uploadedImage.file, null, newAlpha)
      setGradcamData(data)
    } catch (err) {
      console.error('Grad-CAM failed:', err)
      setError(err.message || 'Failed to generate Grad-CAM visualization')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlphaChange = (newAlpha) => {
    setAlpha(newAlpha)
    fetchGradCAM(newAlpha)
  }

  if (!uploadedImage?.file && !predictionResults) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      {/* Loading Overlay */}
      {isLoading && (
        <LoadingSpinner 
          message="Generating Grad-CAM..."
          subMessage="Computing gradients and attention map"
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <FaArrowLeft className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaFire className="text-orange-500" />
                Grad-CAM Visualization
              </h1>
              <p className="text-gray-400 text-sm">
                See where the model focuses its attention
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Visualization Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {gradcamData ? (
              <>
                {/* Comparison Slider */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FaEye className="text-blue-400" />
                    Original vs Attention Map
                  </h3>
                  
                  {uploadedImage?.preview && (
                    <ComparisonSlider
                      beforeImage={uploadedImage.preview}
                      afterImage={`data:image/png;base64,${gradcamData.overlay}`}
                      beforeLabel="Original"
                      afterLabel="Grad-CAM"
                    />
                  )}
                </div>

                {/* Individual Images */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Original */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Original</h4>
                    {uploadedImage?.preview && (
                      <img
                        src={uploadedImage.preview}
                        alt="Original"
                        className="w-full rounded-lg"
                      />
                    )}
                  </motion.div>

                  {/* Heatmap */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Heatmap</h4>
                    <img
                      src={`data:image/png;base64,${gradcamData.heatmap}`}
                      alt="Heatmap"
                      className="w-full rounded-lg"
                    />
                  </motion.div>

                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-4"
                  >
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Overlay</h4>
                    <img
                      src={`data:image/png;base64,${gradcamData.overlay}`}
                      alt="Overlay"
                      className="w-full rounded-lg"
                    />
                  </motion.div>
                </div>

                {/* Prediction Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-400">Target Class</span>
                      <h3 className="text-xl font-bold text-white capitalize">
                        {gradcamData.class_name?.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">Class Index</span>
                      <p className="text-lg font-mono text-blue-400">
                        #{gradcamData.target_class}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : !isLoading && (
              <div className="glass-card p-12 text-center">
                <FaFire className="text-5xl text-orange-500 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">
                  {error || 'Click "Generate Grad-CAM" to visualize model attention'}
                </p>
                {error && (
                  <button
                    onClick={() => fetchGradCAM()}
                    className="mt-4 btn-primary"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Alpha Control */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Overlay Opacity
              </h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.1}
                  value={alpha}
                  onChange={(e) => handleAlphaChange(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>More Original</span>
                  <span className="font-mono text-blue-400">{(alpha * 100).toFixed(0)}%</span>
                  <span>More Heatmap</span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-400" />
                What is Grad-CAM?
              </h3>
              <div className="space-y-4 text-sm text-gray-300">
                <p>
                  <strong className="text-white">Gradient-weighted Class Activation Mapping</strong> 
                  {' '}is a technique for producing visual explanations for CNN decisions.
                </p>
                <p>
                  It uses the gradients of any target concept flowing into the final 
                  convolutional layer to produce a coarse localization map highlighting 
                  important regions in the image.
                </p>
                <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                  <span className="text-xs text-gray-400 block mb-1">Formula</span>
                  <code className="text-blue-400 font-mono text-sm">
                    L = ReLU(Σ α<sub>k</sub> × A<sup>k</sup>)
                  </code>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Color Legend
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-red-500" />
                  <span className="text-gray-300 text-sm">High attention (important)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-yellow-500" />
                  <span className="text-gray-300 text-sm">Medium attention</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-green-500" />
                  <span className="text-gray-300 text-sm">Low attention</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-blue-500" />
                  <span className="text-gray-300 text-sm">Very low attention</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <h3 className="text-lg font-semibold text-white mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Red/warm areas show where the model looks to make its decision</li>
                <li>• The heatmap is generated from the last conv layer (conv5)</li>
                <li>• Adjust opacity to see both the original and attention map</li>
                <li>• If attention seems wrong, the model may need more training</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default GradCAMPage
