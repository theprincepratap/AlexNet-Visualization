import { motion } from 'framer-motion'
import { FaPlay, FaPause, FaFastForward, FaFastBackward } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'

const LAYER_ORDER = [
  { id: 'conv1', name: 'Conv1', type: 'conv' },
  { id: 'relu1', name: 'ReLU1', type: 'relu' },
  { id: 'pool1', name: 'Pool1', type: 'pool' },
  { id: 'conv2', name: 'Conv2', type: 'conv' },
  { id: 'relu2', name: 'ReLU2', type: 'relu' },
  { id: 'pool2', name: 'Pool2', type: 'pool' },
  { id: 'conv3', name: 'Conv3', type: 'conv' },
  { id: 'relu3', name: 'ReLU3', type: 'relu' },
  { id: 'conv4', name: 'Conv4', type: 'conv' },
  { id: 'relu4', name: 'ReLU4', type: 'relu' },
  { id: 'conv5', name: 'Conv5', type: 'conv' },
  { id: 'relu5', name: 'ReLU5', type: 'relu' },
  { id: 'pool5', name: 'Pool5', type: 'pool' },
  { id: 'fc6', name: 'FC6', type: 'fc' },
  { id: 'relu6', name: 'ReLU6', type: 'relu' },
  { id: 'fc7', name: 'FC7', type: 'fc' },
  { id: 'relu7', name: 'ReLU7', type: 'relu' },
  { id: 'fc8', name: 'Output', type: 'fc' },
]

function LayerSlider({ currentLayer, onLayerChange, availableLayers }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const intervalRef = useRef(null)

  // Filter available layers
  const layers = LAYER_ORDER.filter(
    layer => !availableLayers || availableLayers.includes(layer.id)
  )

  const currentIndex = layers.findIndex(l => l.id === currentLayer)

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onLayerChange(prev => {
          const idx = layers.findIndex(l => l.id === prev)
          const nextIdx = (idx + 1) % layers.length
          return layers[nextIdx].id
        })
      }, speed)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed, layers, onLayerChange])

  const handlePrev = () => {
    const newIdx = Math.max(0, currentIndex - 1)
    onLayerChange(layers[newIdx].id)
  }

  const handleNext = () => {
    const newIdx = Math.min(layers.length - 1, currentIndex + 1)
    onLayerChange(layers[newIdx].id)
  }

  const handleSliderChange = (e) => {
    const idx = parseInt(e.target.value)
    onLayerChange(layers[idx].id)
  }

  const typeColors = {
    conv: 'bg-blue-500',
    relu: 'bg-yellow-500',
    pool: 'bg-purple-500',
    fc: 'bg-green-500'
  }

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Layer Navigation</h3>
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
          {currentIndex + 1} / {layers.length}
        </span>
      </div>

      {/* Layer Progress Bar */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {layers.map((layer, idx) => (
            <motion.button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`
                flex-1 h-2 rounded-full transition-all duration-300
                ${idx <= currentIndex ? typeColors[layer.type] : 'bg-white/20'}
                ${idx === currentIndex ? 'ring-2 ring-white/50' : ''}
              `}
              whileHover={{ scale: 1.1 }}
              title={layer.name}
            />
          ))}
        </div>
        
        {/* Slider */}
        <input
          type="range"
          min={0}
          max={layers.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full"
        />
      </div>

      {/* Current Layer Display */}
      <div className="flex items-center justify-center gap-4">
        <div className={`w-3 h-3 rounded-full ${typeColors[layers[currentIndex]?.type]}`} />
        <span className="text-2xl font-bold text-white">
          {layers[currentIndex]?.name}
        </span>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 
                   transition-all duration-300 disabled:opacity-30"
        >
          <FaFastBackward className="text-white" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            p-4 rounded-xl transition-all duration-300
            ${isPlaying 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
          `}
        >
          {isPlaying ? (
            <FaPause className="text-white text-xl" />
          ) : (
            <FaPlay className="text-white text-xl" />
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === layers.length - 1}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 
                   transition-all duration-300 disabled:opacity-30"
        >
          <FaFastForward className="text-white" />
        </button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Animation Speed</span>
          <span className="text-white">{speed}ms</span>
        </div>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Layer Type Legend */}
      <div className="flex flex-wrap justify-center gap-3 pt-2 border-t border-white/10">
        {Object.entries(typeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-xs text-gray-400">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LayerSlider
