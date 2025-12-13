// src/app/api/license/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateLicenseSecure } from '@/lib/license/validator';

/**
 * POST /api/license/validate
 * Public endpoint for TradingView to validate licenses
 * This endpoint is called from within PineScript code
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { licenseKey, botId } = body;

    // Validate required fields
    if (!licenseKey) {
      return NextResponse.json(
        {
          valid: false,
          error: 'License key is required',
        },
        { status: 400 }
      );
    }

    // Get IP address and user agent for security logging
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate license with security checks
    const result = await validateLicenseSecure(licenseKey, {
      botId,
      ipAddress,
      userAgent,
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          reason: result.reason,
        },
        { status: 200 } // Return 200 even for invalid licenses
      );
    }

    return NextResponse.json(
      {
        valid: true,
        expiresAt: result.expiresAt,
        usageCount: result.usageCount,
        maxUsage: result.maxUsage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('License validation error:', error);

    return NextResponse.json(
      {
        valid: false,
        error: 'Validation failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/license/validate?key=XXXX
 * Alternative GET method for simple validation
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const licenseKey = searchParams.get('key');
    const botId = searchParams.get('botId');

    if (!licenseKey) {
      return NextResponse.json(
        {
          valid: false,
          error: 'License key is required',
        },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await validateLicenseSecure(licenseKey, {
      botId: botId || undefined,
      ipAddress,
      userAgent,
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          reason: result.reason,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        expiresAt: result.expiresAt,
        usageCount: result.usageCount,
        maxUsage: result.maxUsage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('License validation error:', error);

    return NextResponse.json(
      {
        valid: false,
        error: 'Validation failed',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 * Allows TradingView to call this endpoint
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Add CORS headers to all responses
export const runtime = 'edge';
export const dynamic = 'force-dynamic';