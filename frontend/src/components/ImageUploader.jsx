import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCloudUploadAlt, FaImage, FaTimes, FaCheckCircle } from 'react-icons/fa'

function ImageUploader({ onImageSelect, selectedImage, disabled }) {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      
      // Read as base64
      const reader = new FileReader()
      reader.onload = () => {
        onImageSelect({
          file,
          preview: previewUrl,
          base64: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }, [onImageSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    disabled
  })

  const clearImage = (e) => {
    e.stopPropagation()
    setPreview(null)
    onImageSelect(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div
        {...getRootProps()}
        className={`
          relative w-full min-h-[300px] rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-white/20 hover:border-white/40 bg-white/5'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {preview || selectedImage?.preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <div className="relative group">
                <img
                  src={preview || selectedImage?.preview}
                  alt="Uploaded preview"
                  className="max-h-[280px] rounded-xl shadow-2xl object-contain"
                />
                
                {/* Success indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full 
                           flex items-center justify-center shadow-lg"
                >
                  <FaCheckCircle className="text-white" />
                </motion.div>

                {/* Clear button */}
                {!disabled && (
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full 
                             flex items-center justify-center shadow-lg
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300
                             hover:bg-red-600"
                  >
                    <FaTimes className="text-white text-sm" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={{ 
                  y: isDragActive ? -10 : 0,
                  scale: isDragActive ? 1.1 : 1 
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <FaCloudUploadAlt className="text-6xl text-blue-500 mb-4 mx-auto" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {isDragActive ? 'Drop your image here!' : 'Upload an Image'}
              </h3>
              
              <p className="text-gray-400 mb-4">
                Drag & drop an image here, or click to browse
              </p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaImage />
                <span>Supports JPEG, PNG, GIF, BMP, WebP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated border effect when dragging */}
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 border-4 border-blue-500 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent)'
            }}
          />
        )}
      </div>
    </motion.div>
  )
}

export default ImageUploader
