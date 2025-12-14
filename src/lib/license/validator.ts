// src/lib/license/validator.ts
import { createClient } from '@/lib/supabase/server';
import { hashLicenseKey } from './generator';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  botId?: string;
  userId?: string;
  expiresAt?: Date;
  usageCount?: number;
  maxUsage?: number;
}

export enum ValidationError {
  INVALID_FORMAT = 'Invalid license key format',
  NOT_FOUND = 'License key not found',
  EXPIRED = 'License has expired',
  REVOKED = 'License has been revoked',
  USAGE_LIMIT = 'License usage limit reached',
  INVALID_BOT = 'License not valid for this bot',
}

/**
 * Validate license key format
 * Expected format: BMAN-XXXX-XXXX-XXXX-XXXX
 */
export function validateLicenseFormat(licenseKey: string): boolean {
  const pattern = /^BMAN-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i;
  return pattern.test(licenseKey);
}

/**
 * Validate a license key
 */
export async function validateLicense(
  licenseKey: string,
  options?: {
    botId?: string;
    incrementUsage?: boolean;
  }
): Promise<ValidationResult> {
  // Check format first
  if (!validateLicenseFormat(licenseKey)) {
    return {
      valid: false,
      reason: ValidationError.INVALID_FORMAT,
    };
  }

  // ✅ FIX: Added await
  const supabase = await createClient();

  // Fetch license from database
  const { data: license, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('license_key', licenseKey)
    .single();

  if (error || !license) {
    return {
      valid: false,
      reason: ValidationError.NOT_FOUND,
    };
  }

  // Check if active
  if (!license.is_active) {
    return {
      valid: false,
      reason: ValidationError.REVOKED,
      botId: license.bot_id,
      userId: license.user_id,
    };
  }

  // Check expiration
  if (license.expires_at) {
    const expiresAt = new Date(license.expires_at);
    if (expiresAt < new Date()) {
      // Auto-deactivate expired license
      await supabase
        .from('licenses')
        .update({ is_active: false })
        .eq('license_key', licenseKey);

      return {
        valid: false,
        reason: ValidationError.EXPIRED,
        botId: license.bot_id,
        userId: license.user_id,
        expiresAt,
      };
    }
  }

  // Check usage limit
  if (license.max_usage !== null && license.usage_count >= license.max_usage) {
    return {
      valid: false,
      reason: ValidationError.USAGE_LIMIT,
      botId: license.bot_id,
      userId: license.user_id,
      usageCount: license.usage_count,
      maxUsage: license.max_usage,
    };
  }

  // Check bot ID if provided
  if (options?.botId && license.bot_id !== options.botId) {
    return {
      valid: false,
      reason: ValidationError.INVALID_BOT,
      botId: license.bot_id,
      userId: license.user_id,
    };
  }

  // Increment usage if requested
  if (options?.incrementUsage) {
    await supabase
      .from('licenses')
      .update({
        usage_count: license.usage_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('license_key', licenseKey);
  }

  return {
    valid: true,
    botId: license.bot_id,
    userId: license.user_id,
    expiresAt: license.expires_at ? new Date(license.expires_at) : undefined,
    usageCount: license.usage_count,
    maxUsage: license.max_usage,
  };
}

/**
 * Validate license with additional security checks
 * (IP address, rate limiting, etc.)
 */
export async function validateLicenseSecure(
  licenseKey: string,
  context: {
    botId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<ValidationResult> {
  // Basic validation first
  const result = await validateLicense(licenseKey, {
    botId: context.botId,
    incrementUsage: false,
  });

  if (!result.valid) {
    return result;
  }

  // ✅ FIX: Added await
  const supabase = await createClient();

  // Check rate limiting (max 100 validations per hour per license)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const { data: recentValidations, error } = await supabase
    .from('license_validations')
    .select('id')
    .eq('license_key', licenseKey)
    .gte('created_at', oneHourAgo.toISOString());

  if (!error && recentValidations && recentValidations.length > 100) {
    return {
      valid: false,
      reason: 'Rate limit exceeded',
      botId: result.botId,
      userId: result.userId,
    };
  }

  // Log this validation
  await supabase.from('license_validations').insert({
    license_key: licenseKey,
    bot_id: context.botId,
    ip_address: context.ipAddress,
    user_agent: context.userAgent,
    success: true,
  });

  // Increment usage count
  await supabase
    .from('licenses')
    .update({
      usage_count: (result.usageCount || 0) + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('license_key', licenseKey);

  return result;
}

/**
 * Get license details (for display purposes)
 */
export async function getLicenseDetails(licenseKey: string) {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { data: license, error } = await supabase
    .from('licenses')
    .select(
      `
      *,
      bots (
        name,
        description,
        created_at
      ),
      profiles (
        email,
        full_name
      )
    `
    )
    .eq('license_key', licenseKey)
    .single();

  if (error || !license) {
    return null;
  }

  return {
    key: license.license_key,
    bot: {
      id: license.bot_id,
      name: license.bots?.name,
      description: license.bots?.description,
    },
    user: {
      id: license.user_id,
      email: license.profiles?.email,
      name: license.profiles?.full_name,
    },
    status: {
      isActive: license.is_active,
      createdAt: new Date(license.created_at),
      expiresAt: license.expires_at ? new Date(license.expires_at) : null,
      lastUsedAt: license.last_used_at
        ? new Date(license.last_used_at)
        : null,
      revokedAt: license.revoked_at ? new Date(license.revoked_at) : null,
    },
    usage: {
      count: license.usage_count,
      maxUsage: license.max_usage,
      remaining: license.max_usage
        ? license.max_usage - license.usage_count
        : null,
    },
  };
}

/**
 * Check if user owns a license for a specific bot
 */
export async function userOwnsLicense(
  userId: string,
  botId: string
): Promise<boolean> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('licenses')
    .select('id')
    .eq('user_id', userId)
    .eq('bot_id', botId)
    .eq('is_active', true)
    .single();

  return !error && data !== null;
}

/**
 * Get active licenses count for a bot
 */
export async function getActiveLicenseCount(botId: string): Promise<number> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('licenses')
    .select('id', { count: 'exact' })
    .eq('bot_id', botId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to count licenses: ${error.message}`);
  }

  return count || 0;
}