import { FiCheckCircle, FiActivity, FiVideo, FiGlobe } from 'react-icons/fi'

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Product Roadmap
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            MyNews continuously innovates and expands the content creation ecosystem
          </p>
        </div>
        
        <div className="relative">
          {/* Using the same connection line style as the HowItWorks component */}
          <div className="absolute top-24 left-[50%] w-0.5 h-[calc(100%-120px)] bg-gradient-to-b from-blue-600 to-purple-600 hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-0 relative z-10">
            {[
              {
                icon: <FiCheckCircle className="w-6 h-6" />,
                title: 'Podcast Creation Platform',
                phase: 'Phase 1',
                description: 'Support for multi-source content to podcast, AI script generation, high-quality TTS, Web3 authentication',
                items: [
                  'News-based podcast generation',
                  'Customizable host settings',
                  'NFT content minting',
                  'One-click podcast distribution'
                ],
                status: 'current',
                color: 'blue'
              },
              {
                icon: <FiActivity className="w-6 h-6" />,
                title: 'Multi-scene Optimization',
                phase: 'Phase 2',
                description: 'Expand support for multiple podcast scenarios, optimize audio quality and content generation',
                items: [
                  'Music radio generation',
                  'Language learning podcasts',
                  'Emotional podcast generation',
                  'Advanced audio effects'
                ],
                status: 'upcoming',
                color: 'purple'
              },
              {
                icon: <FiVideo className="w-6 h-6" />,
                title: 'Multi-modal Content',
                phase: 'Phase 3',
                description: 'Expand to more content forms, creating a full-media creation platform',
                items: [
                  'AI video generation',
                  'Virtual host avatars',
                  'Smart magazine generation',
                  'Content interaction features'
                ],
                status: 'upcoming',
                color: 'cyan'
              },
              {
                icon: <FiGlobe className="w-6 h-6" />,
                title: 'Content Ecosystem',
                phase: 'Phase 4',
                description: 'Build creator community, improve content distribution and monetization channels',
                items: [
                  'Creator community',
                  'Content subscription system',
                  'Creator incentive mechanism',
                  'Decentralized distribution platform'
                ],
                status: 'upcoming',
                color: 'emerald'
              }
            ].map((phase, index) => (
              <div key={index} className="md:flex items-center md:even:flex-row-reverse">
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className={`w-full max-w-md p-6 rounded-2xl border backdrop-blur-sm
                    ${index % 2 === 0 ? 'border-blue-800/50 bg-blue-900/10' : 'border-purple-800/50 bg-purple-900/10'}`}>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4
                      ${index % 2 === 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'}`}>
                      {phase.icon}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-400">{phase.phase}</span>
                        <span className="text-gray-500">·</span>
                        <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                      </div>
                      {phase.status === 'current' ? (
                        <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-green-900/30 text-green-400 border border-green-800/50 ml-auto">
                          Active
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-gray-800/50 text-gray-400 border border-gray-700/50 ml-auto">
                          Planned
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4">{phase.description}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-center text-gray-400 text-sm">
                          <span className={`w-1.5 h-1.5 rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'} mr-2`}></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Using the same number axis style as the HowItWorks component */}
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