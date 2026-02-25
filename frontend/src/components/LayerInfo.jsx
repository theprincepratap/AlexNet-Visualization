import { motion } from 'framer-motion'
import { FaInfoCircle, FaCube, FaCalculator, FaBolt } from 'react-icons/fa'

// Educational information for each layer type
const LAYER_EDUCATION = {
  conv: {
    title: 'Convolutional Layer',
    explanation: 'Applies learned filters (kernels) that slide across the input to detect patterns like edges, textures, and shapes. Each filter creates a feature map highlighting where the pattern exists.',
    icon: FaCube,
    color: 'blue'
  },
  relu: {
    title: 'ReLU Activation',
    explanation: 'Applies the Rectified Linear Unit function: f(x) = max(0, x). This introduces non-linearity, allowing the network to learn complex patterns. Negative values become zero.',
    icon: FaBolt,
    color: 'yellow'
  },
  pool: {
    title: 'Max Pooling Layer',
    explanation: 'Reduces spatial dimensions by taking the maximum value in each region. This provides translation invariance and reduces computation while keeping the most important features.',
    icon: FaCube,
    color: 'purple'
  },
  fc: {
    title: 'Fully Connected Layer',
    explanation: 'Every neuron connects to all neurons from the previous layer. These layers combine all the features extracted by convolutions to make the final classification decision.',
    icon: FaCalculator,
    color: 'green'
  }
}

function LayerInfo({ layerName, layerData }) {
  // Determine layer type from name
  const getLayerType = (name) => {
    if (name.startsWith('conv')) return 'conv'
    if (name.startsWith('relu')) return 'relu'
    if (name.startsWith('pool')) return 'pool'
    if (name.startsWith('fc')) return 'fc'
    return 'conv'
  }

  const layerType = getLayerType(layerName)
  const education = LAYER_EDUCATION[layerType]
  const Icon = education.icon

  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    green: 'text-green-400 bg-green-500/20 border-green-500/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${colorClasses[education.color]}`}>
          <Icon className="text-xl" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {layerData?.name || education.title}
          </h3>
          <span className="text-sm text-gray-400 font-mono">{layerName}</span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <FaInfoCircle className="text-blue-400 mt-1 flex-shrink-0" />
          <p className="text-gray-300 text-sm leading-relaxed">
            {layerData?.description || education.explanation}
          </p>
        </div>
      </div>

      {/* Technical Details */}
      {layerData && (
        <div className="grid grid-cols-2 gap-3">
          {layerData.kernel_size && (
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400 block">Kernel Size</span>
              <span className="text-white font-mono">{layerData.kernel_size}</span>
            </div>
          )}
          {layerData.stride && (
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400 block">Stride</span>
              <span className="text-white font-mono">{layerData.stride}</span>
            </div>
          )}
          {layerData.filters && (
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400 block">Filters</span>
              <span className="text-white font-mono">{layerData.filters}</span>
            </div>
          )}
          {layerData.neurons && (
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400 block">Neurons</span>
              <span className="text-white font-mono">{layerData.neurons}</span>
            </div>
          )}
        </div>
      )}

      {/* Mathematical Formula */}
      {layerData?.formula && (
        <div className="p-4 bg-black/30 rounded-xl border border-white/10">
          <span className="text-xs text-gray-400 block mb-2">Formula</span>
          <code className="text-blue-400 font-mono text-sm">
            {layerData.formula}
          </code>
        </div>
      )}

      {/* Educational Tips */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                    rounded-xl border border-white/10">
        <h4 className="text-sm font-semibold text-white mb-2">
          💡 Did you know?
        </h4>
        {layerType === 'conv' && (
          <p className="text-xs text-gray-300">
            Early convolutional layers typically detect simple features like edges and colors, 
            while deeper layers learn more complex patterns like textures and object parts.
          </p>
        )}
        {layerType === 'relu' && (
          <p className="text-xs text-gray-300">
            ReLU is computationally efficient and helps prevent the vanishing gradient problem, 
            making it the most popular activation function in modern deep learning.
          </p>
        )}
        {layerType === 'pool' && (
          <p className="text-xs text-gray-300">
            Pooling reduces the spatial dimensions by 2x in each direction, dramatically 
            reducing the number of parameters and computation in the network.
          </p>
        )}
        {layerType === 'fc' && (
          <p className="text-xs text-gray-300">
            The fully connected layers contain most of AlexNet's parameters (over 58 million!), 
            which is why modern architectures try to minimize their use.
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default LayerInfo
