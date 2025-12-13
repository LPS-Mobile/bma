// src/app/(admin)/admin/loading.tsx

export default function AdminLoading() {
  return (
    <div className="space-y-8 text-slate-200 max-w-7xl mx-auto p-8">
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="h-10 w-64 bg-slate-800 rounded animate-pulse" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
            <div className="h-8 w-32 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-full bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between">
             <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
             <div className="h-6 w-24 bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="h-48 w-full bg-slate-800/50 rounded animate-pulse flex items-end gap-2 px-4 pb-2">
             {[...Array(12)].map((_, i) => (
               <div key={i} className="w-full bg-slate-800 rounded-t" style={{ height: `${Math.random() * 100}%` }} />
             ))}
          </div>
        </div>

        {/* Side List Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-8 bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
         <div className="flex justify-between">
            <div className="h-6 w-40 bg-slate-800 rounded animate-pulse" />
            <div className="h-6 w-20 bg-slate-800 rounded animate-pulse" />
         </div>
         <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-full bg-slate-800/50 rounded animate-pulse" />
            ))}
         </div>
      </div>
    </div>
  );
}