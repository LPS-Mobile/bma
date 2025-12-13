// src/components/landing/SocialProof.tsx
export function SocialProof() {
  return (
    // ADDED id="social-proof" below so the Navbar link jumps here
    <section id="social-proof" className="py-16 px-4 border-y border-gray-800 bg-gray-900/50 scroll-mt-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-gray-500 mb-8">
            Trusted by traders worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-50">
            {/* Stats */}
            <div>
              <div className="text-3xl font-bold text-white mb-1">9</div>
              <div className="text-sm text-gray-500">Active Traders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">12.4M</div>
              <div className="text-sm text-gray-500">Trades Executed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">$47M</div>
              <div className="text-sm text-gray-500">Volume Traded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">68%</div>
              <div className="text-sm text-gray-500">Avg Win Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}