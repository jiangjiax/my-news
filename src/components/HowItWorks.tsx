import { FiLink, FiSettings, FiFileText, FiPlay, FiShare2 } from 'react-icons/fi'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            如何使用
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            几步简单操作，即可将任何信息源转换为高质量播客内容
          </p>
        </div>
        
        <div className="relative">
          {/* 连接线 */}
          <div className="absolute top-24 left-[50%] w-0.5 h-[calc(100%-120px)] bg-gradient-to-b from-blue-600 to-purple-600 hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-0 relative z-10">
            {[
              {
                icon: <FiLink className="w-6 h-6" />,
                title: '添加信息源',
                description: '支持输入网址或自定义文本作为播客素材'
              },
              {
                icon: <FiSettings className="w-6 h-6" />,
                title: '个性化配置',
                description: '自定义播客名称、节目名称、时长、主播人数（1-2人）、主播姓名、主播音色、NFT配置'
              },
              {
                icon: <FiFileText className="w-6 h-6" />,
                title: '生成脚本',
                description: 'AI 自动分析内容并生成专业播客脚本，支持手动编辑调整'
              },
              {
                icon: <FiPlay className="w-6 h-6" />,
                title: '生成音频',
                description: '高质量 TTS 技术将脚本转换为自然流畅的播客音频'
              },
              {
                icon: <FiShare2 className="w-6 h-6" />,
                title: '发布与变现',
                description: '一键发布到我们的 NFT 市场，支持内容确权与分发变现'
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