// src/app/actions/admin.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

// Check for Service Role Key (Critical for Admin Actions)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error("❌ CRITICAL ERROR: 'SUPABASE_SERVICE_ROLE_KEY' is missing from .env.local. Admin actions will fail.");
}

// Initialize Stripe
// FIX: Cast apiVersion to 'any' to bypass strict type mismatch with newer/beta SDKs
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any, 
});

// Initialize Admin Supabase Client (Bypasses RLS)
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey || '', 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// --- HELPER: Check if requester is Admin ---
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error("⛔ Admin Action Blocked: No user logged in.");
    throw new Error('Unauthorized');
  }
  return user;
}

// 1. BAN USER
export async function banUser(userId: string) {
  console.log(`[Admin] Banning user ${userId}...`);
  await requireAdmin();
  
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h', 
  });
  
  if (authError) throw new Error(authError.message);

  await supabaseAdmin
    .from('users')
    .update({ banned_until: new Date(Date.now() + 876000 * 3600 * 1000).toISOString() })
    .eq('id', userId);

  revalidatePath('/admin');
  console.log(`[Admin] User ${userId} banned successfully.`);
}

// 2. CREATE (OR FIX) USER
export async function createUser(formData: FormData) {
  console.log("[Admin] Processing user creation/repair...");
  await requireAdmin();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  let targetUserId = '';

  // Step A: Try to create in Auth
  const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  // Step B: Handle "Email Exists" Error gracefully
  if (authError) {
    if (authError.message.includes('already been registered') || authError.status === 422) {
        console.warn(`[Admin] User ${email} already exists in Auth. Attempting to repair public record...`);
        let foundUser = null;
        let page = 1;
        while (!foundUser) {
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page: page, perPage: 100 });
            if (error || users.length === 0) break;
            foundUser = users.find(u => u.email === email);
            page++;
        }
        if (foundUser) {
            targetUserId = foundUser.id;
        } else {
            throw new Error(`User exists in Auth but could not be found via Admin API. Manual sync required.`);
        }
    } else {
        console.error("[Admin] Auth creation failed:", authError);
        throw new Error(authError.message);
    }
  } else if (data.user) {
    targetUserId = data.user.id;
  }

  // Step C: Force Sync Public Profile
  if (targetUserId) {
    console.log(`[Admin] Upserting public profile for ${targetUserId}...`);
    const { error: dbError } = await supabaseAdmin.from('users').upsert({
      id: targetUserId,
      email: email,
      full_name: fullName,
      created_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (dbError) {
      console.error("[Admin] DB Sync failed:", dbError);
      throw new Error("Auth succeeded but Profile sync failed: " + dbError.message);
    }
  }

  revalidatePath('/admin');
  console.log("[Admin] User processed successfully.");
  return { success: true };
}

// 3. CHANGE SUBSCRIPTION (Manual Override)
export async function changeUserPlan(userId: string, newPlanId: string) {
  if (!serviceRoleKey) {
    throw new Error("Server Error: Missing Service Role Key. Cannot update subscription.");
  }

  console.log(`[Admin] Changing plan for ${userId} to ${newPlanId}...`);
  await requireAdmin();

  // Handle 'free' plan status logic
  const isFree = newPlanId === 'free';
  const newStatus = isFree ? 'canceled' : 'active';

  // Perform Upsert and return data to confirm
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      status: newStatus,
      plan_id: newPlanId,
      // If free, we set period end to now, otherwise 1 year from now
      current_period_end: new Date(Date.now() + (isFree ? 0 : 365 * 24 * 60 * 60 * 1000)).toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error("[Admin] Failed to update subscription:", error);
    throw new Error(`DB Error: ${error.message}`);
  }

  console.log(`[Admin] Subscription successfully updated:`, data);
  revalidatePath('/admin');
}

// 4. CANCEL SUBSCRIPTION (Stripe + DB)
export async function cancelUserSubscription(userId: string) {
  console.log(`[Admin] Canceling subscription for ${userId}...`);
  await requireAdmin();

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', userId)
    .single();

  if (sub?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(sub.stripe_subscription_id);
    } catch (e) {
      console.error('[Admin] Stripe cancel failed (proceeding to DB update):', e);
    }
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}

// 5. SYNC ALL USERS
export async function syncUsers() {
  console.log("[Admin] Starting Full User Sync...");
  await requireAdmin();

  let allUsers: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw new Error(error.message);
    
    if (users.length > 0) {
      allUsers = [...allUsers, ...users];
      page++;
    } else {
      hasMore = false;
    }
  }
  console.log(`[Admin] Found ${allUsers.length} users in Auth.`);

  let syncedCount = 0;
  for (const user of allUsers) {
    const { error } = await supabaseAdmin.from('users').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Unknown',
        created_at: user.created_at 
    }, { onConflict: 'id' });
    
    if (!error) syncedCount++;
    else console.error(`[Admin] Failed to sync ${user.email}:`, error);
  }
  
  revalidatePath('/admin');
  console.log(`[Admin] Successfully synced ${syncedCount} users.`);
  return { success: true, count: syncedCount };
}

// 6. ENSURE SELF
export async function ensureSelf() {
  console.log("[Admin] Ensuring self exists in public DB...");
  const user = await requireAdmin(); 
  
  const { error } = await supabaseAdmin.from('users').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || 'Admin',
      created_at: new Date().toISOString()
  }, { onConflict: 'id' });

  if (error) {
      console.error("[Admin] Self-repair failed:", error);
      throw new Error(error.message);
  }
  
  revalidatePath('/admin');
  console.log("[Admin] Self-repair complete.");
  return { success: true };
}