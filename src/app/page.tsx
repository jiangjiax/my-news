import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Roadmap from '@/components/Roadmap'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Roadmap />
      <CTA />
      <Footer />
    </main>
  )
}
