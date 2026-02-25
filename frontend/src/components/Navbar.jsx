import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBrain, FaLayerGroup, FaFire, FaInfoCircle, FaRedo } from 'react-icons/fa'

const navItems = [
  { path: '/', label: 'Home', icon: FaBrain },
  { path: '/explore', label: 'Layer Explorer', icon: FaLayerGroup },
  { path: '/gradcam', label: 'Grad-CAM', icon: FaFire },
  { path: '/about', label: 'About', icon: FaInfoCircle },
]

function Navbar({ hasResults, onReset }) {
  const location = useLocation()

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-card border-b border-white/10 border-t-0 border-x-0 rounded-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaBrain className="text-white text-xl" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">AlexNet</h1>
              <p className="text-xs text-gray-400 -mt-1">Vision Explorer</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              const isDisabled = (item.path === '/explore' || item.path === '/gradcam') && !hasResults

              return (
                <Link
                  key={item.path}
                  to={isDisabled ? '#' : item.path}
                  className={`
                    relative px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium
                    transition-all duration-300
                    ${isDisabled 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'hover:bg-white/10'
                    }
                    ${isActive ? 'text-white' : 'text-gray-400'}
                  `}
                  onClick={(e) => isDisabled && e.preventDefault()}
                >
                  <Icon className="text-base" />
                  <span className="hidden md:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* Reset Button */}
            {hasResults && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={onReset}
                className="ml-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 
                         hover:bg-red-500/30 transition-all duration-300
                         flex items-center gap-2 text-sm font-medium"
              >
                <FaRedo />
                <span className="hidden md:inline">Reset</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
