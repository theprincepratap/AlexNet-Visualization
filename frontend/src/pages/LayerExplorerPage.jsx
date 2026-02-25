import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowLeft, FaExpand, FaTimes, FaImage } from 'react-icons/fa'

import LayerSlider from '../components/LayerSlider'
import LayerInfo from '../components/LayerInfo'
import FeatureMapGrid from '../components/FeatureMapGrid'
import { ExplanationCard } from '../components/TooltipExplanation'
import { getLayers } from '../services/api'

// Layer information data
const LAYER_DATA = {
  conv1: {
    name: 'Convolution Layer 1',
    description: 'The first convolutional layer extracts low-level features like edges, corners, and basic textures using 64 filters of size 11×11. This large kernel captures broad spatial patterns from the input.',
    kernel_size: '11×11',
    stride: 4,
    filters: 64,
    formula: 'y = Σ(x * w) + b'
  },
  relu1: {
    name: 'ReLU Activation 1',
    description: 'Applies non-linear activation f(x) = max(0, x) to the convolution output. This introduces non-linearity allowing the network to learn complex patterns.',
    formula: 'f(x) = max(0, x)'
  },
  pool1: {
    name: 'Max Pooling 1',
    description: 'Reduces spatial dimensions by taking the maximum value in each 3×3 region with stride 2. This provides translation invariance and reduces computation.',
    kernel_size: '3×3',
    stride: 2,
    formula: 'y = max(region)'
  },
  conv2: {
    name: 'Convolution Layer 2',
    description: 'Builds upon the low-level features to detect more complex patterns like textures and simple shapes using 192 filters.',
    kernel_size: '5×5',
    stride: 1,
    filters: 192,
    formula: 'y = Σ(x * w) + b'
  },
  relu2: {
    name: 'ReLU Activation 2',
    description: 'Non-linear activation that helps the network learn complex decision boundaries.',
    formula: 'f(x) = max(0, x)'
  },
  pool2: {
    name: 'Max Pooling 2',
    description: 'Further reduces spatial dimensions while keeping the most important features.',
    kernel_size: '3×3',
    stride: 2,
    formula: 'y = max(region)'
  },
  conv3: {
    name: 'Convolution Layer 3',
    description: 'Detects higher-level features by combining patterns from previous layers. Uses 384 filters.',
    kernel_size: '3×3',
    stride: 1,
    filters: 384,
    formula: 'y = Σ(x * w) + b'
  },
  relu3: {
    name: 'ReLU Activation 3',
    description: 'Continues to add non-linearity for learning complex patterns.',
    formula: 'f(x) = max(0, x)'
  },
  conv4: {
    name: 'Convolution Layer 4',
    description: 'Further refines feature representations, detecting object parts and complex textures.',
    kernel_size: '3×3',
    stride: 1,
    filters: 256,
    formula: 'y = Σ(x * w) + b'
  },
  relu4: {
    name: 'ReLU Activation 4',
    description: 'Non-linear activation for learning hierarchical feature representations.',
    formula: 'f(x) = max(0, x)'
  },
  conv5: {
    name: 'Convolution Layer 5',
    description: 'Extracts the highest-level visual features, often corresponding to semantic concepts and object parts.',
    kernel_size: '3×3',
    stride: 1,
    filters: 256,
    formula: 'y = Σ(x * w) + b'
  },
  relu5: {
    name: 'ReLU Activation 5',
    description: 'Final convolutional non-linearity before pooling.',
    formula: 'f(x) = max(0, x)'
  },
  pool5: {
    name: 'Max Pooling 3',
    description: 'Final spatial reduction before the fully connected layers.',
    kernel_size: '3×3',
    stride: 2,
    formula: 'y = max(region)'
  },
  fc6: {
    name: 'Fully Connected Layer 1',
    description: 'First fully connected layer with 4096 neurons that combines all spatial features for high-level reasoning.',
    neurons: 4096,
    formula: 'y = Wx + b'
  },
  relu6: {
    name: 'ReLU Activation 6',
    description: 'Non-linear activation in the fully connected layers.',
    formula: 'f(x) = max(0, x)'
  },
  fc7: {
    name: 'Fully Connected Layer 2',
    description: 'Second fully connected layer with 4096 neurons for further feature abstraction.',
    neurons: 4096,
    formula: 'y = Wx + b'
  },
  relu7: {
    name: 'ReLU Activation 7',
    description: 'Non-linear activation before the final classification layer.',
    formula: 'f(x) = max(0, x)'
  },
  fc8: {
    name: 'Output Layer',
    description: 'Final classification layer with 1000 neurons, one for each ImageNet class. Outputs raw scores (logits).',
    neurons: 1000,
    formula: 'y = Wx + b'
  }
}

function LayerExplorerPage({ predictionResults, uploadedImage }) {
  const navigate = useNavigate()
  const [currentLayer, setCurrentLayer] = useState('conv1')
  const [expandedImage, setExpandedImage] = useState(null)

  // Redirect if no results
  useEffect(() => {
    if (!predictionResults) {
      navigate('/')
    }
  }, [predictionResults, navigate])

  if (!predictionResults) {
    return null
  }

  const activations = predictionResults.activations || {}
  const availableLayers = Object.keys(activations)
  const currentActivation = activations[currentLayer]
  const currentLayerData = LAYER_DATA[currentLayer]

  // Get layer type for styling
  const getLayerType = (name) => {
    if (name.startsWith('conv')) return 'conv'
    if (name.startsWith('relu')) return 'relu'
    if (name.startsWith('pool')) return 'pool'
    if (name.startsWith('fc')) return 'fc'
    return 'conv'
  }

  const layerTypeColors = {
    conv: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    relu: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    pool: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    fc: 'from-green-500/20 to-green-600/20 border-green-500/30'
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
              <h1 className="text-2xl font-bold text-white">Layer Explorer</h1>
              <p className="text-gray-400 text-sm">
                Visualize intermediate activations
              </p>
            </div>
          </div>

          {/* Current Prediction Badge */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 glass-card">
            <FaImage className="text-blue-400" />
            <span className="text-white font-medium capitalize">
              {predictionResults.prediction.replace(/_/g, ' ')}
            </span>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel - Layer Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            <LayerSlider
              currentLayer={currentLayer}
              onLayerChange={setCurrentLayer}
              availableLayers={availableLayers}
            />

            {/* Original Image Preview */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Original Image
              </h3>
              {uploadedImage?.preview && (
                <img
                  src={uploadedImage.preview}
                  alt="Original"
                  className="w-full rounded-lg"
                />
              )}
              {predictionResults.original_image && !uploadedImage?.preview && (
                <img
                  src={`data:image/png;base64,${predictionResults.original_image}`}
                  alt="Original"
                  className="w-full rounded-lg"
                />
              )}
            </div>
          </motion.div>

          {/* Center Panel - Feature Map Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6"
          >
            <div className={`
              glass-card p-6 bg-gradient-to-br 
              ${layerTypeColors[getLayerType(currentLayer)]}
              border
            `}>
              {/* Layer Title */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {currentLayerData?.name || currentLayer}
                </h2>
                {currentActivation?.image && (
                  <button
                    onClick={() => setExpandedImage(currentActivation.image)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <FaExpand className="text-gray-400" />
                  </button>
                )}
              </div>

              {/* Feature Map Display */}
              <AnimatePresence mode="wait">
                {currentActivation?.image ? (
                  <motion.div
                    key={currentLayer}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-xl overflow-hidden bg-black/30"
                  >
                    <img
                      src={`data:image/png;base64,${currentActivation.image}`}
                      alt={`${currentLayer} activation`}
                      className="w-full h-auto"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-64 flex items-center justify-center rounded-xl bg-black/30"
                  >
                    <p className="text-gray-400">
                      No visualization available for this layer
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Metadata */}
              {currentActivation?.metadata && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex flex-wrap gap-3"
                >
                  {currentActivation.metadata.num_channels && (
                    <div className="px-3 py-1.5 bg-blue-500/20 rounded-lg">
                      <span className="text-xs text-gray-400 block">Channels</span>
                      <span className="text-white font-mono">
                        {currentActivation.metadata.num_channels}
                      </span>
                    </div>
                  )}
                  {currentActivation.metadata.spatial_size && (
                    <div className="px-3 py-1.5 bg-purple-500/20 rounded-lg">
                      <span className="text-xs text-gray-400 block">Size</span>
                      <span className="text-white font-mono">
                        {currentActivation.metadata.spatial_size.join('×')}
                      </span>
                    </div>
                  )}
                  {currentActivation.metadata.shown_maps && (
                    <div className="px-3 py-1.5 bg-green-500/20 rounded-lg">
                      <span className="text-xs text-gray-400 block">Shown</span>
                      <span className="text-white font-mono">
                        {currentActivation.metadata.shown_maps} maps
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Panel - Layer Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <LayerInfo 
              layerName={currentLayer} 
              layerData={currentLayerData}
            />
          </motion.div>
        </div>

        {/* All Layers Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            All Layer Activations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(activations).map(([layer, data]) => (
              <motion.button
                key={layer}
                onClick={() => setCurrentLayer(layer)}
                className={`
                  glass-card p-3 transition-all duration-300
                  ${currentLayer === layer ? 'ring-2 ring-blue-500' : 'hover:bg-white/10'}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {data.image && (
                  <img
                    src={`data:image/png;base64,${data.image}`}
                    alt={layer}
                    className="w-full rounded-lg mb-2"
                  />
                )}
                <span className="text-xs text-gray-400 block">{layer}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Expanded Image Modal */}
        <AnimatePresence>
          {expandedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              onClick={() => setExpandedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-w-5xl max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setExpandedImage(null)}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full 
                           flex items-center justify-center z-10 hover:bg-red-600"
                >
                  <FaTimes className="text-white" />
                </button>
                <img
                  src={`data:image/png;base64,${expandedImage}`}
                  alt="Expanded feature map"
                  className="rounded-xl shadow-2xl"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default LayerExplorerPage
