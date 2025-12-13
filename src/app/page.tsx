// src/app/page.tsx
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { PricingTable } from '@/components/landing/PricingTable'
import { Testimonials } from '@/components/landing/Testimonials'
import { SocialProof } from '@/components/landing/SocialProof'
import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <PricingTable />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

function CTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black" />
      
      <div className="relative container mx-auto max-w-4xl text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Ready to Build Your First Bot?
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Join 9 traders using AI to automate their strategies.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </section>
  )
}