import { FiArrowRight, FiUsers, FiMic, FiBox } from 'react-icons/fi'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-20 overflow-hidden relative bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900">
      {/* Visual effects */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600/20 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400">
            Start Your Podcast Creation Journey
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            No professional equipment, no recording skills needed. Just a few simple steps to create high-quality podcast content and ignite your creative inspiration
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-16">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 hover:translate-y-[-2px] transition-all">
                Start Creating Now
                <FiArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:text-white hover:translate-y-[-2px]">
                Browse NFT Marketplace
                <FiBox className="w-5 h-5" />
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                icon: <FiMic />,
                iconBg: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-900/10",
                title: 'Unlimited Creative Possibilities',
                description: 'From news interpretation to language learning, from music radio to feature interviews, explore unlimited possibilities in podcast creation'
              },
              {
                icon: <FiBox />,
                iconBg: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-900/10",
                title: 'NFT Content Monetization',
                description: 'Mint your podcast works as NFTs and achieve value circulation and monetization in our Web3 marketplace'
              },
              {
                icon: <FiUsers />,
                iconBg: "from-green-500 to-teal-500",
                bgColor: "bg-green-900/10",
                title: 'Creator Community',
                description: 'Join our community to exchange experiences with other creators and gain more creative inspiration and feedback'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                {/* Card background decoration */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                {/* Card content */}
                <div className={`p-6 rounded-2xl border border-gray-800/60 backdrop-blur-sm transition-all duration-300 group-hover:border-gray-700/80 group-hover:shadow-xl group-hover:shadow-blue-900/5 h-full flex flex-col ${feature.bgColor}`}>
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-5 text-white shadow-md`}>
                    <div className="text-2xl">
                      {feature.icon}
                    </div>
                  </div>
                  
                  {/* Title and description */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors flex-grow">{feature.description}</p>
                  
                  {/* Bottom decorative line */}
                  <div className="h-0.5 w-1/4 bg-gradient-to-r from-transparent via-gray-700 to-transparent mt-5 group-hover:w-1/3 transition-all duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 