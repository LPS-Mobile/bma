import { createHash, randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';

export interface License {
  key: string;
  botId: string;
  userId: string;
  inviteUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
  usageCount: number;
  maxUsage: number | null;
}

export interface GenerateLicenseOptions {
  botId: string;
  userId: string;
  expiresInDays?: number;
  maxUsage?: number;
}

/**
 * Generate a cryptographically secure license key
 * Format: BMAN-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const segments = 4;
  const segmentLength = 4;
  const parts: string[] = [];

  for (let i = 0; i < segments; i++) {
    const bytes = randomBytes(segmentLength);
    const segment = bytes
      .toString('hex')
      .toUpperCase()
      .substring(0, segmentLength);
    parts.push(segment);
  }

  return `BMAN-${parts.join('-')}`;
}

/**
 * Generate a secure hash of the license key for validation
 */
export function hashLicenseKey(licenseKey: string): string {
  return createHash('sha256').update(licenseKey).digest('hex');
}

/**
 * Create a new license for a bot
 */
export async function createLicense(
  options: GenerateLicenseOptions
): Promise<License> {
  // ✅ FIX: Added await
  const supabase = await createClient();
  const { botId, userId, expiresInDays, maxUsage } = options;

  // Generate unique license key
  const licenseKey = generateLicenseKey();
  const licenseHash = hashLicenseKey(licenseKey);

  // Calculate expiration date
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  // Generate invite URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${baseUrl}/install/${licenseKey}`;

  // Store in database
  const { data, error } = await supabase
    .from('licenses')
    .insert({
      license_key: licenseKey,
      license_hash: licenseHash,
      bot_id: botId,
      user_id: userId,
      invite_url: inviteUrl,
      expires_at: expiresAt,
      is_active: true,
      usage_count: 0,
      max_usage: maxUsage || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create license: ${error.message}`);
  }

  return {
    key: licenseKey,
    botId: data.bot_id,
    userId: data.user_id,
    inviteUrl: data.invite_url,
    createdAt: new Date(data.created_at),
    expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    isActive: data.is_active,
    usageCount: data.usage_count,
    maxUsage: data.max_usage,
  };
}

/**
 * Revoke a license (deactivate it)
 */
export async function revokeLicense(licenseKey: string): Promise<boolean> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { error } = await supabase
    .from('licenses')
    .update({ is_active: false, revoked_at: new Date().toISOString() })
    .eq('license_key', licenseKey);

  if (error) {
    throw new Error(`Failed to revoke license: ${error.message}`);
  }

  return true;
}

/**
 * Get all licenses for a specific bot
 */
export async function getBotLicenses(botId: string): Promise<License[]> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('bot_id', botId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch licenses: ${error.message}`);
  }

  return data.map((row) => ({
    key: row.license_key,
    botId: row.bot_id,
    userId: row.user_id,
    inviteUrl: row.invite_url,
    createdAt: new Date(row.created_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    isActive: row.is_active,
    usageCount: row.usage_count,
    maxUsage: row.max_usage,
  }));
}

/**
 * Get all licenses for a user
 */
export async function getUserLicenses(userId: string): Promise<License[]> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user licenses: ${error.message}`);
  }

  return data.map((row) => ({
    key: row.license_key,
    botId: row.bot_id,
    userId: row.user_id,
    inviteUrl: row.invite_url,
    createdAt: new Date(row.created_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
    isActive: row.is_active,
    usageCount: row.usage_count,
    maxUsage: row.max_usage,
  }));
}

/**
 * Increment usage count for a license
 */
export async function incrementLicenseUsage(
  licenseKey: string
): Promise<boolean> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_license_usage', {
    key: licenseKey,
  });

  if (error) {
    throw new Error(`Failed to increment usage: ${error.message}`);
  }

  return true;
}

/**
 * Check if a license has reached its usage limit
 */
export async function isLicenseAtLimit(licenseKey: string): Promise<boolean> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('licenses')
    .select('usage_count, max_usage')
    .eq('license_key', licenseKey)
    .single();

  if (error || !data) {
    return true; // Assume at limit if error
  }

  if (data.max_usage === null) {
    return false; // Unlimited usage
  }

  return data.usage_count >= data.max_usage;
}

/**
 * Generate multiple licenses in bulk (for premium features)
 */
export async function createBulkLicenses(
  options: GenerateLicenseOptions,
  count: number
): Promise<License[]> {
  const licenses: License[] = [];

  for (let i = 0; i < count; i++) {
    const license = await createLicense(options);
    licenses.push(license);
  }

  return licenses;
}

/**
 * Clean up expired licenses (run periodically)
 */
export async function cleanupExpiredLicenses(): Promise<number> {
  // ✅ FIX: Added await
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('licenses')
    .update({ is_active: false })
    .lt('expires_at', new Date().toISOString())
    .eq('is_active', true)
    .select();

  if (error) {
    throw new Error(`Failed to cleanup licenses: ${error.message}`);
  }

  return data?.length || 0;
}