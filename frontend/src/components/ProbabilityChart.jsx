import { motion } from 'framer-motion'
import { FaTrophy, FaMedal } from 'react-icons/fa'

function ProbabilityChart({ probabilities }) {
  if (!probabilities || probabilities.length === 0) {
    return null
  }

  // Get rank icon
  const getRankIcon = (index) => {
    if (index === 0) return <FaTrophy className="text-yellow-400" />
    if (index === 1) return <FaMedal className="text-gray-300" />
    if (index === 2) return <FaMedal className="text-amber-600" />
    return null
  }

  // Get color based on probability
  const getBarColor = (prob, index) => {
    if (index === 0) return 'from-blue-500 to-blue-400'
    if (prob > 20) return 'from-blue-600 to-blue-500'
    if (prob > 10) return 'from-blue-700 to-blue-600'
    return 'from-blue-800 to-blue-700'
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FaTrophy className="text-yellow-500" />
        Top 5 Predictions
      </h3>

      <div className="space-y-4">
        {probabilities.map((item, index) => (
          <motion.div
            key={item.class}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRankIcon(index)}
                <span className="text-sm text-gray-300 capitalize truncate max-w-[200px]">
                  {item.class.replace(/_/g, ' ')}
                </span>
              </div>
              <span className={`text-sm font-mono font-semibold ${
                index === 0 ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {item.probability.toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.probability}%` }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
                className={`h-full rounded-full bg-gradient-to-r ${getBarColor(item.probability, index)}`}
                style={{
                  boxShadow: index === 0 ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Winner highlight */}
      {probabilities[0]?.probability > 50 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
          <p className="text-green-400 text-sm">
            <span className="font-semibold">High Confidence!</span> The model is quite certain 
            about this prediction.
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default ProbabilityChart
