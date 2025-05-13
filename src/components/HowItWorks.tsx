import { FiLink, FiSettings, FiFileText, FiPlay, FiShare2 } from 'react-icons/fi'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            How It Works
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            Convert any information source into high-quality podcast content with just a few simple steps
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-24 left-[50%] w-0.5 h-[calc(100%-120px)] bg-gradient-to-b from-blue-600 to-purple-600 hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-0 relative z-10">
            {[
              {
                icon: <FiLink className="w-6 h-6" />,
                title: 'Add Information Source',
                description: 'Support for URLs or custom text as podcast material'
              },
              {
                icon: <FiSettings className="w-6 h-6" />,
                title: 'Personalize Configuration',
                description: 'Customize podcast name, episode title, duration, number of hosts (1-2), host names, host voices, and NFT settings'
              },
              {
                icon: <FiFileText className="w-6 h-6" />,
                title: 'Generate Script',
                description: 'AI automatically analyzes content and generates professional podcast scripts, with support for manual editing'
              },
              {
                icon: <FiPlay className="w-6 h-6" />,
                title: 'Create Audio',
                description: 'High-quality TTS technology converts scripts into natural, fluid podcast audio'
              },
              {
                icon: <FiShare2 className="w-6 h-6" />,
                title: 'Publish and Monetize',
                description: 'One-click publishing to our NFT marketplace, supporting content authentication and monetization'
              }
            ].map((step, index) => (
              <div key={index} className="md:flex items-center md:even:flex-row-reverse">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className={`w-full max-w-md p-6 rounded-2xl border backdrop-blur-sm
                    ${index % 2 === 0 ? 'border-blue-800/50 bg-blue-900/10' : 'border-purple-800/50 bg-purple-900/10'}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4
                      ${index % 2 === 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'}`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
                
                <div className="hidden md:flex w-16 justify-center relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl
                    ${index % 2 === 0 ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="w-full md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 