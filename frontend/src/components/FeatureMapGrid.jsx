import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaExpand, FaTimes, FaLayerGroup } from 'react-icons/fa'

function FeatureMapGrid({ layerName, imageData, metadata, onSelect }) {
  const [selectedMap, setSelectedMap] = useState(null)

  if (!imageData) {
    return null
  }

  const handleMapClick = (e) => {
    e.stopPropagation()
    setSelectedMap(imageData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-4 cursor-pointer group"
      onClick={() => onSelect && onSelect(layerName)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaLayerGroup className="text-blue-400" />
          <span className="text-sm font-medium text-white">{layerName}</span>
        </div>
        <button
          onClick={handleMapClick}
          className="p-2 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 
                   transition-all duration-300 hover:bg-white/20"
        >
          <FaExpand className="text-sm text-gray-400" />
        </button>
      </div>

      {/* Feature Map Image */}
      <div className="relative overflow-hidden rounded-lg bg-black/30">
        <img
          src={`data:image/png;base64,${imageData}`}
          alt={`${layerName} feature maps`}
          className="w-full h-auto object-contain transition-transform duration-300 
                   group-hover:scale-105"
        />
      </div>

      {/* Metadata */}
      {metadata && (
        <div className="mt-3 flex flex-wrap gap-2">
          {metadata.num_channels && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
              {metadata.num_channels} channels
            </span>
          )}
          {metadata.spatial_size && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">
              {metadata.spatial_size[0]}×{metadata.spatial_size[1]}
            </span>
          )}
          {metadata.shown_maps && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
              Showing {metadata.shown_maps}
            </span>
          )}
        </div>
      )}

      {/* Fullscreen Modal */}
      {selectedMap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedMap(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative max-w-4xl max-h-[90vh] overflow-auto"
          >
            <button
              onClick={() => setSelectedMap(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full 
                       flex items-center justify-center z-10 hover:bg-red-600"
            >
              <FaTimes className="text-white" />
            </button>
            <img
              src={`data:image/png;base64,${selectedMap}`}
              alt="Enlarged feature map"
              className="rounded-xl shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default FeatureMapGrid
