// src/app/api/bots/[botId]/license/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLicense, getBotLicenses, revokeLicense } from '@/lib/license/generator';

// FIX 1: 'params' must be defined as a Promise
interface RouteContext {
  params: Promise<{
    botId: string;
  }>;
}

/**
 * GET /api/bots/[botId]/license
 * Get all licenses for a bot
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // FIX 2: Await the params before destructuring
    const { botId } = await context.params; 
    
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('user_id')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    if (bot.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all licenses for this bot
    const licenses = await getBotLicenses(botId);

    return NextResponse.json({ licenses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bots/[botId]/license
 * Generate a new license for a bot
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // FIX 3: Await the params
    const { botId } = await context.params;
    
    const body = await request.json();
    const { expiresInDays, maxUsage } = body;

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('user_id, name, pinescript_code')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    if (bot.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check user's subscription tier for license limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    const tier = subscription?.tier || 'free_trial';

    // Check if user can create more licenses based on tier
    const existingLicenses = await getBotLicenses(botId);
    const activeLicenses = existingLicenses.filter((l) => l.isActive);

    const limits: Record<string, number> = {
      free_trial: 0,
      builder: 5,
      live_trader: 20,
      automation_pro: -1, // Unlimited
    };

    const maxLicenses = limits[tier] || 0;
    if (maxLicenses !== -1 && activeLicenses.length >= maxLicenses) {
      return NextResponse.json(
        {
          error: `License limit reached for ${tier} tier. Maximum: ${maxLicenses}`,
        },
        { status: 403 }
      );
    }

    // Generate new license
    const license = await createLicense({
      botId,
      userId: user.id,
      expiresInDays,
      maxUsage,
    });

    // Get the bot's PineScript code to inject license
    const { injectLicenseIntoPineScript } = await import('@/lib/pinescript/injector');
    const licensedCode = injectLicenseIntoPineScript(
      bot.pinescript_code,
      license.key
    );

    return NextResponse.json(
      {
        license: {
          key: license.key,
          inviteUrl: license.inviteUrl,
          expiresAt: license.expiresAt,
          usageCount: license.usageCount,
          maxUsage: license.maxUsage,
        },
        code: licensedCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      {
        error: 'Failed to create license',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bots/[botId]/license
 * Revoke a license
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // FIX 4: Await the params
    const { botId } = await context.params;
    
    const { searchParams } = new URL(request.url);
    const licenseKey = searchParams.get('key');

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'License key required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify bot ownership
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('user_id')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    if (bot.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify license belongs to this bot
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('bot_id')
      .eq('license_key', licenseKey)
      .single();

    if (licenseError || !license || license.bot_id !== botId) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    // Revoke the license
    await revokeLicense(licenseKey);

    return NextResponse.json(
      { message: 'License revoked successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error revoking license:', error);
    return NextResponse.json(
      { error: 'Failed to revoke license' },
      { status: 500 }
    );
  }
}