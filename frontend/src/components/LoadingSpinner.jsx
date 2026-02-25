import { motion } from 'framer-motion'
import { FaBrain } from 'react-icons/fa'

function LoadingSpinner({ message = 'Processing...', subMessage = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="text-center">
        {/* Animated Brain */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="relative mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FaBrain className="text-4xl text-white" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse" />
        </motion.div>

        {/* Neural Network Animation */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15
              }}
              className="w-3 h-3 rounded-full bg-blue-500"
            />
          ))}
        </div>

        {/* Message */}
        <motion.h3
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xl font-semibold text-white mb-2"
        >
          {message}
        </motion.h3>

        {subMessage && (
          <p className="text-gray-400 text-sm">{subMessage}</p>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
              className="text-2xl text-blue-400"
            >
              •
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Inline Loading for smaller areas
function InlineLoader({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`spinner ${sizes[size]}`} />
    </div>
  )
}

// Skeleton loader for content
function Skeleton({ className = '', variant = 'rect' }) {
  const baseClass = 'animate-pulse bg-white/10 rounded'
  const variants = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 rounded'
  }

  return <div className={`${baseClass} ${variants[variant]} ${className}`} />
}

export { LoadingSpinner, InlineLoader, Skeleton }
export default LoadingSpinner
