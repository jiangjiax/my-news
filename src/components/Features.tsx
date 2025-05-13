import { FiMic, FiGlobe, FiCpu, FiFeather, FiTrendingUp, FiKey } from 'react-icons/fi'

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Key Features
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            MyNews provides an all-in-one podcast creation experience, integrating multiple innovative technologies
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <FiMic />,
              title: 'AI Content Generation',
              description: 'Convert any text or webpage content into professional podcast scripts, intelligently analyzing and extracting key information'
            },
            {
              icon: <FiGlobe />,
              title: 'Easy Source Import',
              description: 'Support for URL links and custom text input, quickly acquire creation materials, start content creation with one click'
            },
            {
              icon: <FiFeather />,
              title: 'High-Quality TTS',
              description: 'Advanced speech synthesis technology, multiple voice options, natural and fluid podcast audio effects'
            },
            {
              icon: <FiCpu />,
              title: 'Personalized Customization',
              description: 'Customize podcast name, episode title, duration, host configuration, easily create unique podcast content'
            },
            {
              icon: <FiKey />,
              title: 'Web3 Authentication',
              description: 'Content NFT minting and RWA asset on-chain, helping creators achieve content ownership confirmation and monetization'
            },
            {
              icon: <FiTrendingUp />,
              title: 'NFT Market Distribution',
              description: 'One-click publishing to dedicated NFT marketplace, achieving decentralized content distribution and value circulation, expanding creative influence'
            },
          ].map((feature, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative h-full p-8 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-900/10 group-hover:border-gray-700 overflow-hidden">
                <div className="absolute top-0 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                <div className="w-14 h-14 rounded-xl bg-gray-800 text-blue-400 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 