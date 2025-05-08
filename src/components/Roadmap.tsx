import { FiCheckCircle, FiActivity, FiVideo, FiGlobe } from 'react-icons/fi'

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            产品路线图
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg">
            MyNews 持续创新，不断扩展内容创作生态
          </p>
        </div>
        
        <div className="relative">
          {/* 使用与 HowItWorks 组件相同的连接线样式 */}
          <div className="absolute top-24 left-[50%] w-0.5 h-[calc(100%-120px)] bg-gradient-to-b from-blue-600 to-purple-600 hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-0 relative z-10">
            {[
              {
                icon: <FiCheckCircle className="w-6 h-6" />,
                title: '阶段一：播客创作平台上线',
                description: '支持多源内容转播客、AI脚本生成、高质量TTS、Web3确权功能',
                items: [
                  '资讯类播客生成',
                  '定制化主播设置',
                  'NFT内容铸造',
                  '播客一键分发'
                ],
                status: 'current',
                color: 'blue'
              },
              {
                icon: <FiActivity className="w-6 h-6" />,
                title: '阶段二：多场景播客优化',
                description: '扩展多种播客场景支持，优化音频质量与内容生成',
                items: [
                  '音乐电台生成',
                  '语言学习播客',
                  '情感类播客生成',
                  '高级音频特效'
                ],
                status: 'upcoming',
                color: 'purple'
              },
              {
                icon: <FiVideo className="w-6 h-6" />,
                title: '阶段三：多模态内容支持',
                description: '拓展至更多内容形态，打造全媒体创作平台',
                items: [
                  'AI视频生成',
                  '虚拟主播形象',
                  '智能杂志生成',
                  '内容互动功能'
                ],
                status: 'upcoming',
                color: 'cyan'
              },
              {
                icon: <FiGlobe className="w-6 h-6" />,
                title: '阶段四：内容生态与平台化',
                description: '构建创作者社区，完善内容分发与变现渠道',
                items: [
                  '创作者社区',
                  '内容订阅系统',
                  '创作者激励机制',
                  '去中心化分发平台'
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
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                      {phase.status === 'current' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-900/50 text-green-400 border border-green-800">
                          进行中
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                          即将推出
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
                
                {/* 使用与 HowItWorks 组件相同的序号轴样式 */}
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