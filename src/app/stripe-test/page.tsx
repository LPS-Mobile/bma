'use client';

// src/app/stripe-test/page.tsx
import { useEffect, useState } from 'react';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}

export default function StripeTestPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testStripe();
  }, []);

  const testStripe = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/test');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test Stripe',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔷 Stripe Connection Test</h1>
          <p className="text-gray-400">
            Testing Stripe API connection and configuration
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Testing Stripe connection...</p>
          </div>
        )}

        {/* Results */}
        {!loading && result && (
          <div className="space-y-6">
            {/* Status Card */}
            <div
              className={`border rounded-lg p-6 ${
                result.success
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-red-900/20 border-red-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  {result.success ? '✅' : '❌'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {result.success ? 'Connection Successful!' : 'Connection Failed'}
                  </h2>
                  <p className="text-gray-300 mt-1">
                    {result.message || result.error}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            {result.details && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Configuration Details</h3>

                {/* API Key Status */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-blue-400">
                    API Key
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Stripe secret key configured</span>
                  </div>
                </div>

                {/* Balance */}
                {result.details.balance && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-blue-400">
                      Account Balance
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        Available:{' '}
                        {result.details.balance.available
                          .map((b: any) => `${b.amount / 100} ${b.currency.toUpperCase()}`)
                          .join(', ') || 'None'}
                      </div>
                      <div>
                        Pending:{' '}
                        {result.details.balance.pending
                          .map((b: any) => `${b.amount / 100} ${b.currency.toUpperCase()}`)
                          .join(', ') || 'None'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products */}
                {result.details.products && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-blue-400">
                      Products ({result.details.products.count})
                    </h4>
                    {result.details.products.count > 0 ? (
                      <div className="space-y-2">
                        {result.details.products.list.map((product: any) => (
                          <div
                            key={product.id}
                            className="bg-gray-800 p-3 rounded border border-gray-700"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  product.active
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}
                              >
                                {product.active ? 'Active' : 'Inactive'}
                              </span>
                              <span className="font-medium">{product.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {product.id}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-yellow-500">
                        ⚠️ No products found. Create products in Stripe Dashboard.
                      </p>
                    )}
                  </div>
                )}

                {/* Price IDs */}
                {result.details.prices && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-blue-400">
                      Price Configuration
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            result.details.prices.configured.builder
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {result.details.prices.configured.builder ? '✓' : '✗'}
                        </span>
                        <span>Builder Plan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            result.details.prices.configured.liveTrade
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {result.details.prices.configured.liveTrade ? '✓' : '✗'}
                        </span>
                        <span>Live Trader Plan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            result.details.prices.configured.automationPro
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {result.details.prices.configured.automationPro ? '✓' : '✗'}
                        </span>
                        <span>Automation Pro Plan</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Webhook */}
                {result.details.webhook && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-blue-400">
                      Webhook
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          result.details.webhook.secretSet
                            ? 'text-green-500'
                            : 'text-red-500'
                        }
                      >
                        {result.details.webhook.secretSet ? '✓' : '✗'}
                      </span>
                      <span>Webhook secret configured</span>
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.details.warnings && result.details.warnings.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-500 rounded p-4">
                    <h4 className="text-lg font-semibold mb-2 text-yellow-400">
                      ⚠️ Warnings
                    </h4>
                    <ul className="space-y-1">
                      {result.details.warnings.map((warning: string, index: number) => (
                        <li key={index} className="text-yellow-300">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Raw Response */}
            <details className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <summary className="cursor-pointer font-semibold mb-2">
                Raw Response (Click to expand)
              </summary>
              <pre className="text-xs bg-gray-950 p-4 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={testStripe}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Test Again
              </button>
              <a
                href="/dashboard"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}