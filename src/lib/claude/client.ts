// src/lib/claude/client.ts
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model configurations
export const MODELS = {
  FAST: 'claude-sonnet-4-20250514', // Fast responses for strategy generation
  SMART: 'claude-opus-4-20250514', // More complex reasoning (if needed)
} as const;

// Rate limiting and retry logic
export interface ClaudeCallOptions {
  maxTokens?: number;
  temperature?: number;
  retries?: number;
  timeout?: number;
}

export async function callClaude(
  prompt: string,
  options: ClaudeCallOptions = {}
): Promise<string> {
  const {
    maxTokens = 8000,
    temperature = 0.7,
    retries = 3,
    timeout = 60000,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const message = await anthropic.messages.create({
        model: MODELS.FAST,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      clearTimeout(timeoutId);

      // Extract text content
      const textContent = message.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;
    } catch (error) {
      lastError = error as Error;
      console.error(`Claude API attempt ${attempt + 1} failed:`, error);

      // Don't retry on certain errors
      if (error instanceof Anthropic.APIError) {
        if (error.status === 401 || error.status === 403) {
          throw new Error('Invalid API key');
        }
        if (error.status === 400) {
          throw new Error('Invalid request format');
        }
      }

      // Wait before retry with exponential backoff
      if (attempt < retries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw new Error(
    `Failed after ${retries} attempts: ${lastError?.message || 'Unknown error'}`
  );
}

// Token counting helper
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// Cost calculator (as of 2025 pricing)
export function calculateCost(inputTokens: number, outputTokens: number): number {
  // Claude Sonnet pricing (example, adjust to actual)
  const INPUT_COST_PER_1K = 0.003;
  const OUTPUT_COST_PER_1K = 0.015;

  return (
    (inputTokens / 1000) * INPUT_COST_PER_1K +
    (outputTokens / 1000) * OUTPUT_COST_PER_1K
  );
}