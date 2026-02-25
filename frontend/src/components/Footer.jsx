import { FaGithub, FaHeart, FaBrain } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="relative z-10 mt-auto py-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 text-gray-400">
            <FaBrain className="text-blue-500" />
            <span className="text-sm">AlexNet Vision Explorer</span>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Made with</span>
            <FaHeart className="text-red-500 mx-1" />
            <span>for AI Education</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              <FaGithub className="text-xl" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} AlexNet Vision Explorer. Built with React, FastAPI & PyTorch.
        </div>
      </div>
    </footer>
  )
}

export default Footer
