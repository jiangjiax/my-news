'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FiHeadphones, FiMenu, FiX, FiBox, FiEdit, FiChevronDown } from 'react-icons/fi'
import WalletConnectButton from './WalletConnectButton'

export default function Header() {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const appMenuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (appMenuRef.current && !appMenuRef.current.contains(event.target as Node)) {
        setShowAppMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-gradient-to-r from-gray-900/80 to-gray-900/80 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <FiHeadphones className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">MyNews</span>
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link href="/#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
              <Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">How It Works</Link>
              <Link href="/#roadmap" className="text-gray-300 hover:text-white transition-colors">Roadmap</Link>
            </nav>
            
            {/* Application menu */}
            <div className="relative" ref={appMenuRef}>
              <button 
                onClick={() => setShowAppMenu(!showAppMenu)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all shadow-md shadow-blue-900/20"
              >
                App Center
                <FiChevronDown className={`transition-transform ${showAppMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showAppMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/70 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700/50">
                    Select Function
                  </div>
                  <Link href="/dashboard">
                    <div className="px-4 py-3 text-white hover:bg-blue-600/20 transition-colors flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center group-hover:bg-blue-600/50 transition-colors">
                        <FiEdit className="text-blue-300" />
                      </div>
                      <div>
                        <div className="font-medium">Creator Studio</div>
                        <div className="text-xs text-gray-400">Create your podcast content</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/marketplace">
                    <div className="px-4 py-3 text-white hover:bg-purple-600/20 transition-colors flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center group-hover:bg-purple-600/50 transition-colors">
                        <FiBox className="text-purple-300" />
                      </div>
                      <div>
                        <div className="font-medium">NFT Marketplace</div>
                        <div className="text-xs text-gray-400">Browse and buy podcast NFTs</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/70 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
          
          {/* Right menu/buttons */}
          <div className="flex items-center gap-4">
            {/* Insert wallet connection button */}
            <div className="hidden md:block">
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800/50 animate-fadeIn">
          <nav className="px-4 py-4 space-y-2">
            <Link href="/#features" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors">
              How It Works
            </Link>
            <Link href="/#roadmap" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors">
              Roadmap
            </Link>
            
            <div className="pt-2 border-t border-gray-800/50">
              <div className="px-4 py-2 text-xs text-gray-500">Apps</div>
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors">
                <FiEdit className="text-blue-400" />
                Creator Studio
              </Link>
              <Link href="/marketplace" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-colors">
                <FiBox className="text-purple-400" />
                NFT Marketplace
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
} 