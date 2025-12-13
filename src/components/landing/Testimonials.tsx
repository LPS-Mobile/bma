export function Testimonials() {
  const testimonials = [
    {
      name: 'Marcus Chen',
      role: 'Day Trader',
      avatar: 'MC',
      rating: 5,
      text: "I've been coding my own bots for 3 years. This tool generated a better strategy in 5 minutes than I could build in a week. The backtesting caught issues I would've missed. Already profitable.",
      metric: '+127% in 60 days',
      verified: true,
    },
    {
      name: 'Sarah Mitchell',
      role: 'Swing Trader',
      avatar: 'SM',
      rating: 5,
      text: "Finally, a bot builder that doesn't require a CS degree. I described my RSI strategy in plain English, tweaked the parameters, and deployed. Now my bot trades while I sleep.",
      metric: '68% win rate',
      verified: true,
    },
    {
      name: 'David Rodriguez',
      role: 'Algo Trader',
      avatar: 'DR',
      rating: 5,
      text: "The AI generates clean PineScript code that I can actually read and modify. License protection is solid—my strategies stay mine. Worth every penny for the time saved.",
      metric: 'Saved 40+ hours/month',
      verified: true,
    },
    {
      name: 'Jessica Park',
      role: 'Crypto Trader',
      avatar: 'JP',
      rating: 5,
      text: "Backtested 15 different strategies before finding my winner. The metrics dashboard showed me exactly which setups worked. No more guessing. Just data-driven trading.",
      metric: '2.3x profit factor',
      verified: true,
    },
    {
      name: 'Tommy Lee',
      role: 'Futures Trader',
      avatar: 'TL',
      rating: 5,
      text: "The consultation call with Botman was gold. He reviewed my strategy, pointed out the flaws, and helped me optimize it. Bot's been running flawlessly for 3 months.",
      metric: 'Max DD reduced by 40%',
      verified: true,
    },
    {
      name: 'Rachel Foster',
      role: 'Options Trader',
      avatar: 'RF',
      rating: 5,
      text: "I was skeptical about AI-generated bots. Then I tested one against my manual trading. The bot had better discipline, no emotional mistakes, and crushed my returns. I'm converted.",
      metric: 'Outperformed manual by 34%',
      verified: true,
    },
  ]

  return (
    // ADDED id="testimonials" and scroll-mt-20 here
    <section id="testimonials" className="py-24 px-4 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden scroll-mt-20">
      {/* Background Effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm text-emerald-400 font-semibold">9 traders trust Botman AI</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Traders Are Saying
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real results from real traders. No fake reviews. No BS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    
                    {/* Name & Role */}
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {testimonial.name}
                        {testimonial.verified && (
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-300 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Metric Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-semibold text-emerald-400">{testimonial.metric}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        

        {/* Trust Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
            <div className="text-sm text-gray-400">Average Rating</div>
            <div className="flex justify-center gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>

          <div>
            <div className="text-4xl font-bold text-white mb-2">7</div>
            <div className="text-sm text-gray-400">5-Star Reviews</div>
          </div>

          <div>
            <div className="text-4xl font-bold text-white mb-2">94%</div>
            <div className="text-sm text-gray-400">Would Recommend</div>
          </div>

          <div>
            <div className="text-4xl font-bold text-white mb-2">9</div>
            <div className="text-sm text-gray-400">Active Traders</div>
          </div>
        </div>

        {/* Platform Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-50">
          <div className="text-gray-400 text-sm">As featured on:</div>
          <div className="text-gray-500 font-semibold">TradingView Community</div>
          <div className="text-gray-500 font-semibold">Algo Trading Forum</div>
          <div className="text-gray-500 font-semibold">r/algotrading</div>
          <div className="text-gray-500 font-semibold">QuantConnect</div>
        </div>
      </div>
    </section>
  )
}