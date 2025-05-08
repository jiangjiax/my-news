import { FiMic, FiGlobe, FiCpu, FiFeather, FiTrendingUp, FiKey } from 'react-icons/fi'

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            核心功能
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            MyNews 提供一站式播客创作体验，集成多项创新技术
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <FiMic />,
              title: 'AI内容生成',
              description: '将任何文本或网页内容转换为专业的播客脚本，智能分析并提炼关键信息'
            },
            {
              icon: <FiGlobe />,
              title: '便捷信息源导入',
              description: '支持网址链接与自定义文本输入，快速获取创作素材，一键开始内容创作'
            },
            {
              icon: <FiFeather />,
              title: '高质量TTS',
              description: '先进的语音合成技术，多种音色选择，自然流畅的播客音频效果'
            },
            {
              icon: <FiCpu />,
              title: '个性化定制',
              description: '自定义播客名称、节目名称、时长、主播配置，轻松打造独特播客内容'
            },
            {
              icon: <FiKey />,
              title: 'Web3确权',
              description: '内容NFT铸造与RWA资产上链，帮助创作者实现内容所有权确认与收益变现'
            },
            {
              icon: <FiTrendingUp />,
              title: 'NFT市场分发',
              description: '一键发布至专属NFT市场，实现内容去中心化分发与价值流通，扩大创作影响力'
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