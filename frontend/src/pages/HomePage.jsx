import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaRocket, FaBrain, FaLayerGroup, FaFire, FaChartBar } from 'react-icons/fa'

import ImageUploader from '../components/ImageUploader'
import ProbabilityChart from '../components/ProbabilityChart'
import LoadingSpinner from '../components/LoadingSpinner'
import { predictFromFile } from '../services/api'

function HomePage({ 
  uploadedImage, 
  setUploadedImage, 
  predictionResults, 
  setPredictionResults,
  isProcessing,
  setIsProcessing 
}) {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const handleStartVisualization = async () => {
    if (!uploadedImage?.file) return

    setIsProcessing(true)
    setError(null)

    try {
      const results = await predictFromFile(uploadedImage.file)
      setPredictionResults(results)
    } catch (err) {
      console.error('Prediction failed:', err)
      setError(err.message || 'Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const features = [
    {
      icon: FaLayerGroup,
      title: 'Layer Explorer',
      description: 'Visualize activations at every layer',
      color: 'blue'
    },
    {
      icon: FaFire,
      title: 'Grad-CAM',
      description: 'See what the model focuses on',
      color: 'orange'
    },
    {
      icon: FaChartBar,
      title: 'Probability Analysis',
      description: 'Understand prediction confidence',
      color: 'green'
    }
  ]

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Loading Overlay */}
      {isProcessing && (
        <LoadingSpinner 
          message="Analyzing Image..."
          subMessage="Running through AlexNet layers"
        />
      )}

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 
                       border border-blue-500/30 rounded-full mb-6"
            >
              <FaBrain className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                Interactive CNN Visualization
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">AlexNet </span>
              <span className="text-gradient">Vision Explorer</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Upload an image and watch how a deep neural network processes it layer by layer.
              Understand convolutions, activations, and see where AI focuses its attention.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <ImageUploader 
                onImageSelect={setUploadedImage}
                selectedImage={uploadedImage}
                disabled={isProcessing}
              />

              {/* Action Button */}
              <motion.button
                onClick={handleStartVisualization}
                disabled={!uploadedImage || isProcessing}
                className={`
                  w-full py-4 rounded-xl font-semibold text-lg
                  flex items-center justify-center gap-3
                  transition-all duration-300
                  ${uploadedImage && !isProcessing
                    ? 'btn-primary'
                    : 'bg-white/10 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={uploadedImage ? { scale: 1.02 } : {}}
                whileTap={uploadedImage ? { scale: 0.98 } : {}}
              >
                <FaRocket />
                {isProcessing ? 'Processing...' : 'Start Visualization'}
              </motion.button>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {predictionResults ? (
                <>
                  {/* Prediction Result */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-6 text-center"
                  >
                    <span className="text-sm text-gray-400 block mb-2">
                      Predicted Class
                    </span>
                    <h2 className="text-3xl font-bold text-gradient capitalize">
                      {predictionResults.prediction.replace(/_/g, ' ')}
                    </h2>
                    <span className="text-sm text-blue-400 mt-2 block">
                      {predictionResults.probabilities[0]?.probability.toFixed(1)}% confidence
                    </span>
                  </motion.div>

                  {/* Probability Chart */}
                  <ProbabilityChart probabilities={predictionResults.probabilities} />

                  {/* Navigation Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => navigate('/explore')}
                      className="btn-secondary flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaLayerGroup />
                      Explore Layers
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/gradcam')}
                      className="btn-secondary flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaFire />
                      View Grad-CAM
                    </motion.button>
                  </div>
                </>
              ) : (
                /* Feature Cards */
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    What you'll discover
                  </h3>
                  {features.map((feature, idx) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="glass-card-hover p-4 flex items-center gap-4"
                    >
                      <div className={`
                        p-3 rounded-xl
                        ${feature.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''}
                        ${feature.color === 'orange' ? 'bg-orange-500/20 text-orange-400' : ''}
                        ${feature.color === 'green' ? 'bg-green-500/20 text-green-400' : ''}
                      `}>
                        <feature.icon className="text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      {!predictionResults && (
        <section className="py-16 px-4 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center text-white mb-12"
            >
              How AlexNet Works
            </motion.h2>

            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: 1, title: 'Input', desc: '224×224 RGB image' },
                { step: 2, title: 'Conv Layers', desc: 'Extract features' },
                { step: 3, title: 'Pooling', desc: 'Reduce dimensions' },
                { step: 4, title: 'FC Layers', desc: 'Combine features' },
                { step: 5, title: 'Output', desc: '1000 class probs' },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 
                               flex items-center justify-center text-blue-400 font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
