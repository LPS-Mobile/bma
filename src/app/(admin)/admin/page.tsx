import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

// Force dynamic rendering to ensure fresh data fetch
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function AdminPage() {
  // 1. AUTHENTICATION (Standard Client with Cookies)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 2. SETUP DATABASE CLIENT (Smart Fallback)
  // We prefer the Service Role key (bypasses RLS) but fall back to the standard client
  // if the key is missing in your local .env file.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let dbClient: any = supabase; // Default to standard authenticated client

  if (serviceRoleKey) {
    console.log("✅ [AdminPage] Using Service Role Key for Data Access")
    dbClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  } else {
    console.warn("⚠️ [AdminPage] SUPABASE_SERVICE_ROLE_KEY missing. Falling back to authenticated user client.")
  }

  // 3. FETCH DATA (Parallel)
  console.log("[AdminPage] Fetching tables...")
  const [usersRes, subsRes, botsRes, depsRes] = await Promise.all([
    dbClient.from('users').select('*').order('created_at', { ascending: false }),
    dbClient.from('subscriptions').select('*'),
    dbClient.from('bots').select('*'),
    dbClient.from('deployments').select('*').order('created_at', { ascending: false })
  ])

  // Log errors explicitly
  if (usersRes.error) console.error("❌ Users Fetch Error:", usersRes.error.message)
  if (depsRes.error) console.error("❌ Deployments Fetch Error:", depsRes.error.message)

  // 4. PROCESS DATA & MANUAL JOINS
  const users = usersRes.data || []
  const subscriptions = subsRes.data || []
  const bots = botsRes.data || []
  const deploymentsRaw = depsRes.data || []

  // ⭐ DEBUG: Print counts to your terminal
  console.log(`[AdminPage] Fetched: ${users.length} Users, ${bots.length} Bots, ${deploymentsRaw.length} Deployments`)

  // Join Subscriptions to Users
  const allUsers = users.map((u: any) => ({
    ...u,
    subscriptions: subscriptions.filter((s: any) => s.user_id === u.id)
  }))

  // Join Bots and Users to Deployments
  const allDeployments = deploymentsRaw.map((d: any) => {
    // Handle deleted/missing relations gracefully
    const relatedBot = bots.find((b: any) => b.id === d.bot_id)
    const relatedUser = users.find((u: any) => u.id === d.user_id)
    
    return {
      ...d,
      bots: { 
        name: relatedBot?.name || 'Deleted Bot', 
        logic_explanation: relatedBot?.description || '' 
      },
      users: { 
        email: relatedUser?.email || 'Unknown User' 
      }
    }
  })

  // Filter paying users
  const payingUsers = allUsers.filter((u: any) => 
    u.subscriptions && u.subscriptions.length > 0 && u.subscriptions[0].status === 'active'
  )

  // Calculate MRR
  const mrr = payingUsers.reduce((acc: number, user: any) => {
    const plan = user.subscriptions[0].plan_id
    const price = plan === 'builder' ? 49 : plan === 'live_trader' ? 99 : plan === 'automation_pro' ? 299 : 0
    return acc + price
  }, 0)

  // Top Locations Mock
  const topLocations = [
    { country: 'United States', count: Math.floor(allUsers.length * 0.6) },
    { country: 'United Kingdom', count: Math.floor(allUsers.length * 0.2) },
    { country: 'Germany', count: Math.floor(allUsers.length * 0.1) },
  ]

  // Identify Power Users
  const powerUsers = allUsers
    .map((u: any) => ({
      ...u,
      bot_count: bots.filter((b: any) => b.user_id === u.id).length,
      plan_name: u.subscriptions?.[0]?.status === 'active' 
        ? (u.subscriptions[0].plan_id === 'builder' ? 'Builder' 
          : u.subscriptions[0].plan_id === 'live_trader' ? 'Live Trader'
          : u.subscriptions[0].plan_id === 'automation_pro' ? 'Automation Pro'
          : 'Unknown') 
        : 'Free'
    }))
    .sort((a: any, b: any) => b.bot_count - a.bot_count)
    .slice(0, 5)

  const dashboardData = {
    stats: {
      mrr,
      totalUsers: allUsers.length,
      activeBots: bots.filter((b: any) => b.status === 'active').length,
      payingCount: payingUsers.length
    },
    topLocations,
    powerUsers,
    recentUsers: allUsers.slice(0, 10),
    allUsers, 
    deployments: allDeployments
  }

  return <AdminDashboardClient data={dashboardData} />
}