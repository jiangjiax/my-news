import { FiPlay, FiArrowRight, FiMic, FiKey, FiUsers, FiGlobe } from 'react-icons/fi'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-28 sm:py-40">
      {/* Background effects and dynamic lines */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-[-15%] top-[-25%] w-[700px] h-[700px] bg-blue-700/25 rounded-full filter blur-3xl"></div>
        <div className="absolute right-[-10%] top-[10%] w-[500px] h-[500px] bg-purple-700/20 rounded-full filter blur-3xl"></div>
        <div className="absolute left-1/2 top-0 w-[120vw] h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-purple-500/0 opacity-60 -translate-x-1/2"></div>
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 flex flex-col items-center">
        {/* Main title */}
        <h1 className="text-center font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-blue-100 text-5xl sm:text-6xl md:text-7xl leading-[1.08] mb-6 drop-shadow-xl select-none pb-1">
          Create. Own. Everything.
        </h1>
        {/* Subtitle */}
        <p className="max-w-2xl text-center text-blue-100/90 text-xl sm:text-2xl font-light leading-relaxed mb-14">
          In the decentralized era, everyone is a creator.<br></br>Make every creative work authenticated, monetized, and circulated, truly belonging to you.
        </p>
        {/* Button group */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg mb-20">
          <Link href="/dashboard" className="flex-1">
            <button className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 hover:from-blue-800 hover:to-purple-800 text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 text-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 tracking-wide">
              <FiPlay className="w-6 h-6" />
              Get Start
            </button>
          </Link>
          <Link href="#how-it-works" className="flex-1">
            <button className="w-full py-4 px-6 bg-gray-900/90 hover:bg-gray-800 border border-gray-700 text-blue-200 font-bold rounded-2xl flex items-center justify-center gap-3 text-xl transition-all hover:text-white hover:border-blue-400 tracking-wide">
              How It Works
              <FiArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
        {/* Value propositions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full mt-2">
          {[
            { icon: <FiMic className="w-6 h-6" />, title: "AI Powered", desc: "Auto-generate professional podcasts" },
            { icon: <FiKey className="w-6 h-6" />, title: "Web3 Authentication", desc: "Content asset monetization" },
            { icon: <FiUsers className="w-6 h-6" />, title: "No-Barrier Creation", desc: "Anyone can become a host" },
            { icon: <FiGlobe className="w-6 h-6" />, title: "Decentralized Distribution", desc: "Wider influence reach" }
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-800/40 border border-gray-700/40 hover:border-blue-400/40 transition-all duration-200 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-900/40 to-purple-900/30 flex items-center justify-center mb-3 text-blue-300 shadow">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-1 tracking-wide">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 