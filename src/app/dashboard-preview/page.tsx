import { Button } from '@/components/ui/button'

export default function DashboardPreview() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar - Terminal Style */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left - Brand */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">B</span>
                </div>
                <span className="text-lg font-bold">Botman AI</span>
              </div>
              
              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-1 text-sm">
                <a href="/dashboard-preview" className="px-3 py-1.5 text-white bg-gray-800 rounded-lg font-medium">Dashboard</a>
                <a href="/bot-preview" className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Bot Builder</a>
                <a href="#" className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Analytics</a>
                <a href="#" className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">Marketplace</a>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg text-xs">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-gray-400">2 bots active</span>
              </div>

              <Button variant="outline" size="sm">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                3
              </Button>
              
              <Button variant="primary" size="sm">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Bot
              </Button>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
                TU
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* Trial Banner - Terminal Style Alert */}
        <div className="mb-6 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-blue-400">FREE_TRIAL</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-400">12 days remaining</span>
              </div>
              <p className="text-sm text-gray-300">
                You're limited to 1 bot. Upgrade to Builder for unlimited bots + TradingView deployment.
              </p>
            </div>
            <Button variant="primary" size="sm">
              Upgrade →
            </Button>
          </div>
        </div>

        {/* Stats Grid - Trading Terminal Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Stat Card 1 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-500 uppercase">Active Bots</span>
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">2</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-emerald-400">+100%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-500 uppercase">Total Trades</span>
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">147</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-blue-400">+23</span>
                <span className="text-gray-500">this week</span>
              </div>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-500 uppercase">Win Rate</span>
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1">68.4%</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-emerald-400">+5.2%</span>
                <span className="text-gray-500">improvement</span>
              </div>
            </div>
          </div>

          {/* Stat Card 4 */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-500 uppercase">Net P&L</span>
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-3xl font-bold mb-1 text-emerald-400">$2,847</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-emerald-400">+$483</span>
                <span className="text-gray-500">this week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Bot List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-mono">ACTIVE_BOTS</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  All Status
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  Sort: Recent
                </button>
              </div>
            </div>

            {/* Bot Card 1 - Premium Terminal Style */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
              {/* Header Bar */}
              <div className="bg-gray-900/80 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <span className="text-xs font-mono text-gray-500">bot_001.pine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded border border-emerald-500/20">
                    LIVE
                  </span>
                  <button className="text-gray-500 hover:text-white">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    RSI Scalper
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </h3>
                  <p className="text-sm text-gray-400 font-mono">
                    Strategy: RSI(14) &lt; 30 → LONG | RSI(14) &gt; 70 → SHORT
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-black/30 rounded-lg border border-gray-800">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">WIN_RATE</div>
                    <div className="text-lg font-bold text-emerald-400">72.3%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">PROFIT_FACTOR</div>
                    <div className="text-lg font-bold">2.41</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">TRADES</div>
                    <div className="text-lg font-bold">89</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">MAX_DD</div>
                    <div className="text-lg font-bold text-red-400">-8.2%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">NET_P&L</div>
                    <div className="text-lg font-bold text-emerald-400">+$1,847</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Analytics
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configure
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Bot Card 2 */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group">
              <div className="bg-gray-900/80 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <span className="text-xs font-mono text-gray-500">bot_002.pine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-mono rounded border border-blue-500/20">
                    TESTING
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">MACD Crossover</h3>
                  <p className="text-sm text-gray-400 font-mono">
                    Strategy: MACD line crosses signal → LONG/SHORT
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-4 p-4 bg-black/30 rounded-lg border border-gray-800">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">WIN_RATE</div>
                    <div className="text-lg font-bold text-emerald-400">64.8%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">PROFIT_FACTOR</div>
                    <div className="text-lg font-bold">1.89</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">TRADES</div>
                    <div className="text-lg font-bold">58</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">MAX_DD</div>
                    <div className="text-lg font-bold text-red-400">-12.4%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 font-mono">NET_P&L</div>
                    <div className="text-lg font-bold text-emerald-400">+$1,000</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Deploy Live
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Continue Testing
                  </Button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="bg-gray-900/30 border border-gray-800 border-dashed rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-500 mb-4 font-mono text-sm">
                Free trial: 1/1 bots used
              </p>
              <Button variant="outline" size="md">
                Upgrade to create more bots
              </Button>
            </div>
          </div>

          {/* Right Column - Activity Feed & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-mono text-gray-400 uppercase mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a href="/bot-preview" className="w-full flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all text-left">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Create Bot</div>
                    <div className="text-xs text-gray-400">AI generates your strategy</div>
                  </div>
                </a>

                <button className="w-full flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-800 rounded-lg hover:bg-gray-800 transition-all text-left">
                  <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">View Analytics</div>
                    <div className="text-xs text-gray-400">Performance insights</div>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-800 rounded-lg hover:bg-gray-800 transition-all text-left">
                  <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Schedule Call</div>
                    <div className="text-xs text-gray-400">Talk with Botman</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-mono text-gray-400 uppercase mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">Trade executed</div>
                    <div className="text-xs text-gray-500 font-mono">RSI Scalper • +$47.23</div>
                    <div className="text-xs text-gray-600">2 minutes ago</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">Bot deployed</div>
                    <div className="text-xs text-gray-500 font-mono">RSI Scalper</div>
                    <div className="text-xs text-gray-600">1 hour ago</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">Trade executed</div>
                    <div className="text-xs text-gray-500 font-mono">RSI Scalper • +$82.15</div>
                    <div className="text-xs text-gray-600">3 hours ago</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">Backtest completed</div>
                    <div className="text-xs text-gray-500 font-mono">MACD Crossover</div>
                    <div className="text-xs text-gray-600">5 hours ago</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium">Bot created</div>
                    <div className="text-xs text-gray-500 font-mono">MACD Crossover</div>
                    <div className="text-xs text-gray-600">1 day ago</div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 text-xs text-gray-500 hover:text-white transition-colors font-mono">
                View all activity →
              </button>
            </div>

            {/* System Status */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-mono text-gray-400 uppercase mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">API Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-400">Operational</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">TradingView</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-400">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Backtesting</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-400">Online</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">License Server</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-400">Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500 font-mono">
                  Last updated: 2 min ago
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-2">Need Help?</h3>
              <p className="text-xs text-gray-400 mb-4">
                Get personalized strategy optimization from our experts.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}