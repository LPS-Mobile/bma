import { createClient } from '@/lib/supabase/server'
import { UploadButton } from './upload-button' // See Phase 3.5 below

export default async function AdminDeploymentQueue() {
  const supabase = createClient()

  // Fetch pending requests joined with Bot details to get the "Explanation"
  const { data: requests } = await supabase
    .from('deployments')
    .select(`
      *,
      bots (
        name,
        description,
        logic_explanation -- The AI generated explanation
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
                <h3 className="font-bold text-lg">{req.bots.name}</h3>
                <p className="text-sm text-blue-600">{req.users.email} • {req.platform}</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {req.status}
              </span>
            </div>

            <div className="bg-slate-100 p-3 rounded text-sm text-slate-700">
              <strong>Strategy Logic:</strong>
              <p>{req.bots.logic_explanation || "No explanation available"}</p>
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