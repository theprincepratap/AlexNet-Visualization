import { useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Pages
import HomePage from './pages/HomePage'
import LayerExplorerPage from './pages/LayerExplorerPage'
import GradCAMPage from './pages/GradCAMPage'
import AboutPage from './pages/AboutPage'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  // Global state for image and results
  const [uploadedImage, setUploadedImage] = useState(null)
  const [predictionResults, setPredictionResults] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Handler for setting results from API
  const handlePredictionComplete = useCallback((results) => {
    setPredictionResults(results)
    setIsProcessing(false)
  }, [])

  // Handler for image upload
  const handleImageUpload = useCallback((imageData) => {
    setUploadedImage(imageData)
    setPredictionResults(null)
  }, [])

  // Reset all state
  const handleReset = useCallback(() => {
    setUploadedImage(null)
    setPredictionResults(null)
    setIsProcessing(false)
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-dark-500 flex flex-col">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        </div>

        {/* Navigation */}
        <Navbar hasResults={!!predictionResults} onReset={handleReset} />

        {/* Main Content */}
        <main className="flex-grow relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <HomePage 
                    uploadedImage={uploadedImage}
                    setUploadedImage={handleImageUpload}
                    predictionResults={predictionResults}
                    setPredictionResults={handlePredictionComplete}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                } 
              />
              <Route 
                path="/explore" 
                element={
                  <LayerExplorerPage 
                    predictionResults={predictionResults}
                    uploadedImage={uploadedImage}
                  />
                } 
              />
              <Route 
                path="/gradcam" 
                element={
                  <GradCAMPage 
                    uploadedImage={uploadedImage}
                    predictionResults={predictionResults}
                  />
                } 
              />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  )
}

export default App
