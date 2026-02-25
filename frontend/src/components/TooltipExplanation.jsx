import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaQuestionCircle } from 'react-icons/fa'

const EXPLANATIONS = {
  convolution: {
    title: 'Convolution Operation',
    content: 'A convolution slides a small filter (kernel) across the input image. At each position, it multiplies the filter values with the corresponding pixel values and sums them up. This creates a feature map that highlights where the pattern (like an edge or texture) was detected.',
    formula: 'y[i,j] = Σ Σ x[i+m, j+n] × k[m, n]'
  },
  relu: {
    title: 'ReLU Activation',
    content: 'ReLU (Rectified Linear Unit) is a simple but powerful activation function. It passes positive values unchanged but converts all negative values to zero. This non-linearity allows the network to learn complex patterns that linear functions cannot represent.',
    formula: 'f(x) = max(0, x)'
  },
  pooling: {
    title: 'Max Pooling',
    content: 'Max pooling reduces the spatial dimensions of feature maps by taking the maximum value in each local region (typically 2×2 or 3×3). This reduces computation, provides a form of translation invariance, and helps the network focus on the most prominent features.',
    formula: 'y = max(region)'
  },
  softmax: {
    title: 'Softmax Function',
    content: 'Softmax converts a vector of raw scores (logits) into probabilities that sum to 1. It exponentiates each value and normalizes by the sum, making larger values exponentially more likely than smaller ones.',
    formula: 'P(class_i) = e^(z_i) / Σ e^(z_j)'
  },
  gradcam: {
    title: 'Grad-CAM',
    content: 'Gradient-weighted Class Activation Mapping (Grad-CAM) visualizes which parts of an image are important for a specific prediction. It computes gradients flowing back to the last convolutional layer and uses them to weight the feature maps, creating a heatmap of importance.',
    formula: 'L = ReLU(Σ α_k × A^k)'
  },
  backpropagation: {
    title: 'Backpropagation',
    content: 'The algorithm used to train neural networks by computing gradients. It calculates how much each weight contributed to the error and adjusts them to minimize the loss function. Uses the chain rule of calculus to propagate errors backward through the network.',
    formula: '∂L/∂w = ∂L/∂y × ∂y/∂w'
  },
  featureMap: {
    title: 'Feature Map',
    content: 'A feature map is the output of a convolutional filter applied to an input. Each filter learns to detect a specific pattern, so a feature map shows where that pattern was found. Early layers detect simple features (edges), while deeper layers detect complex patterns (objects).',
    formula: 'F = σ(W * X + b)'
  }
}

function TooltipExplanation({ type, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const explanation = EXPLANATIONS[type]

  if (!explanation) return children

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help border-b border-dotted border-blue-400"
      >
        {children}
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-80"
          >
            <div className="glass-card p-4 text-left">
              <h4 className="text-sm font-semibold text-white mb-2">
                {explanation.title}
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                {explanation.content}
              </p>
              {explanation.formula && (
                <div className="p-2 bg-black/30 rounded-lg">
                  <code className="text-xs text-blue-400 font-mono">
                    {explanation.formula}
                  </code>
                </div>
              )}
              {/* Arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 
                            bg-white/10 transform rotate-45 -mt-1.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Standalone explanation card
function ExplanationCard({ type, showIcon = true }) {
  const explanation = EXPLANATIONS[type]
  
  if (!explanation) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="p-2 rounded-lg bg-blue-500/20">
            <FaQuestionCircle className="text-blue-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {explanation.title}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            {explanation.content}
          </p>
          {explanation.formula && (
            <div className="p-3 bg-black/30 rounded-xl border border-white/10">
              <span className="text-xs text-gray-400 block mb-1">Formula</span>
              <code className="text-blue-400 font-mono">
                {explanation.formula}
              </code>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export { TooltipExplanation, ExplanationCard, EXPLANATIONS }
export default TooltipExplanation
