import { createClient } from '@/lib/supabase/server'
import { UploadButton } from './upload-button' 

export default async function AdminDeploymentQueue() {
  // FIX: await createClient() because it returns a Promise
  const supabase = await createClient()

  // Fetch pending requests joined with Bot details to get the "Explanation"
  const { data: requests } = await supabase
    .from('deployments')
    .select(`
      *,
      bots (
        name,
        description,
        logic_explanation
      ),
      users ( email )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Deployment Queue</h1>
      
      <div className="grid gap-4">
        {requests?.map((req) => (
          <div key={req.id} className="border p-4 rounded bg-white shadow flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                {/* Check if bots is an array or single object (usually single with .single(), but here it's an array join) */}
                {/* Note: In Supabase joins, if it's a 1-to-1 or N-to-1, it might return an object. 
                    If it returns an array, you'll need req.bots[0]?.name. 
                    Based on your code, assuming TypeScript knows it's a single relation or you treat it as such. */}
                <h3 className="font-bold text-lg">
                  {Array.isArray(req.bots) ? req.bots[0]?.name : req.bots?.name}
                </h3>
                <p className="text-sm text-blue-600">
                  {Array.isArray(req.users) ? req.users[0]?.email : req.users?.email} • {req.platform}
                </p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {req.status}
              </span>
            </div>

            <div className="bg-slate-100 p-3 rounded text-sm text-slate-700">
              <strong>Strategy Logic:</strong>
              <p>
                {(Array.isArray(req.bots) ? req.bots[0]?.logic_explanation : req.bots?.logic_explanation) || "No explanation available"}
              </p>
            </div>

            {/* The Upload Action */}
            <div className="border-t pt-4">
               <UploadButton deploymentId={req.id} />
            </div>
          </div>
        ))}
        {requests?.length === 0 && <p>No pending requests.</p>}
      </div>
    </div>
  )
}