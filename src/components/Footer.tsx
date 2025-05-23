import { FiTwitter, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              MyNews
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered Web3 Podcast Creation Platform
            </p>
          </div>
          
          <div className="flex space-x-8">
            <a href="https://x.com/JJJ44129022" className="text-gray-400 hover:text-white transition-colors">
              <FiTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 