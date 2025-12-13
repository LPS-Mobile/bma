'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Send, FileCode, Terminal, Rocket, CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"

interface RequestDeploymentProps {
  botId: string
  platform: string
  botName: string
  onSuccess?: () => void
}

export default function RequestDeployment({ botId, platform, botName, onSuccess }: RequestDeploymentProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [projectName, setProjectName] = useState(botName)
  const supabase = createClient()

  const isExpertReview = platform === "Expert Review";

  const handleRequest = async () => {
    // 1. Validation
    if (!projectName.trim()) {
      toast.error("Project name is required")
      return
    }

    if (!botId || botId === 'new') {
        toast.error("Bot Not Saved", { 
            description: "Please save your bot strategy first before proceeding." 
        });
        return;
    }

    setLoading(true)
    
    try {
      // 2. Expert Review Flow (Stripe Checkout)
      if (isExpertReview) {
        const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              botId: botId,
              planType: 'expert_review',
            }),
        });
  
        const data = await response.json();
  
        if (!response.ok) throw new Error(data.error || 'Checkout failed');
  
        // Redirect to Stripe
        if (data.url) {
            window.location.href = data.url;
            return; // Stop execution here as page will redirect
        }
      } 
      
      // 3. Standard Deployment Flow (Database Insert)
      else {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            toast.error("Authentication Error", { description: "Please log in again." })
            return
        }

        const { error } = await supabase
            .from('deployments')
            .insert({
            bot_id: botId,
            user_id: user.id,
            platform: platform,
            project_name: projectName,
            status: 'pending'
            })

        if (error) throw error

        toast.success("Build Request Sent!", {
            description: `Our engineers are building "${projectName}" for ${platform}.`
        })
        
        setOpen(false)
        if (onSuccess) onSuccess()
      }

    } catch (error: any) {
      console.error("Request Error:", JSON.stringify(error, null, 2))
      let msg = error?.message || "An unexpected error occurred."
      
      if (error?.code === '42P01') {
        msg = "System Error: Table missing. Contact admin."
      }

      toast.error("Failed to submit request", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isExpertReview ? (
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
                <Rocket className="w-4 h-4 mr-2" />
                Request Expert Review ($99)
            </Button>
        ) : (
            <Button variant="outline" className="w-full justify-start gap-2 border-slate-700 hover:bg-slate-800 hover:text-white transition-all">
                <FileCode className="w-4 h-4 text-blue-500" />
                <span className="flex-1 text-left">Deploy to {platform}</span>
            </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isExpertReview ? <Rocket className="w-5 h-5 text-orange-500" /> : <Terminal className="w-5 h-5 text-blue-500" />}
            {isExpertReview ? "Expert Code Review" : `Deploy to ${platform}`}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isExpertReview 
                ? "Get a professional quant to optimize your code and risk management." 
                : "Configure your export settings. This will generate a compiled strategy file."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name" className="text-slate-200">Project Name</Label>
                <Input 
                    id="name"
                    value={projectName} 
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white focus:ring-blue-500"
                    placeholder="e.g. My Scalper v2"
                />
                <p className="text-[11px] text-slate-500">
                    {isExpertReview ? "Name of the strategy you want reviewed." : `Internal name for ${platform}.`}
                </p>
            </div>
        </div>

        <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleRequest} disabled={loading} className={isExpertReview ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}>
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                ) : (
                    isExpertReview ? <CreditCard className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />
                )}
                {isExpertReview ? "Proceed to Checkout" : "Submit Request"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}