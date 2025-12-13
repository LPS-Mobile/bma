// src/lib/pinescript/injector.ts

export interface LicenseInjectionParams {
  code: string
  licenseKey: string
  validationEndpoint: string
}

export function injectLicenseValidation(params: LicenseInjectionParams): string {
  const { code, licenseKey, validationEndpoint } = params

  // Insert license validation at the beginning of the strategy
  const licenseCheck = `
// ════════════════════════════════════════════════════════════
// LICENSE VALIDATION - DO NOT MODIFY
// ════════════════════════════════════════════════════════════
// @license: ${licenseKey}
// @validation_endpoint: ${validationEndpoint}
// This bot is licensed to you via Botman AI. 
// Unauthorized distribution or modification is prohibited.
// ════════════════════════════════════════════════════════════

`

  return licenseCheck + code
}

export function extractLicenseKey(code: string): string | null {
  const match = code.match(/@license:\s*([a-f0-9-]+)/i)
  return match ? match[1] : null
}