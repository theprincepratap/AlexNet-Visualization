import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaArrowsAltH } from 'react-icons/fa'

function ComparisonSlider({ 
  beforeImage, 
  afterImage, 
  beforeLabel = 'Original', 
  afterLabel = 'Processed' 
}) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const handleTouchMove = (e) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  return (
    <div className="glass-card p-4">
      {/* Labels */}
      <div className="flex justify-between mb-4">
        <span className="text-sm text-gray-400">{beforeLabel}</span>
        <span className="text-sm text-gray-400">{afterLabel}</span>
      </div>

      {/* Comparison Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square rounded-xl overflow-hidden cursor-ew-resize"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Before Image (Full) */}
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* After Image (Clipped) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Slider Line */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-10 h-10 bg-white rounded-full shadow-lg 
                        flex items-center justify-center">
            <FaArrowsAltH className="text-gray-700" />
          </div>
        </motion.div>

        {/* Labels on Image */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 rounded-lg text-sm text-white">
          {beforeLabel}
        </div>
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 rounded-lg text-sm text-white">
          {afterLabel}
        </div>
      </div>

      {/* Slider Input */}
      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  )
}

export default ComparisonSlider
