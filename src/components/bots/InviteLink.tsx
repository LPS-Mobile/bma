'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Ensure lowercase matches file system
import { Copy, Check, ExternalLink, Share2, Key, Loader2 } from 'lucide-react';

interface InviteLinkProps {
  botId: string;
  botName: string;
  onGenerate?: () => void;
}

export default function InviteLink({ botId, botName, onGenerate }: InviteLinkProps) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      // Simulation of API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockKey = `LIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setLicenseKey(mockKey);
      
      const url = `${window.location.origin}/tradingview/install?license=${mockKey}&bot=${botId}`;
      setInviteUrl(url);
      
      if (onGenerate) onGenerate();
    } catch (error) {
      console.error('Failed to generate invite:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTradingView = () => {
    window.open(inviteUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {!inviteUrl ? (
        // STATE 1: Generate Invite
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Key className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Generate TradingView Invite</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Create a secure invite link to install <span className="font-semibold text-white">{botName}</span> on TradingView
            </p>
          </div>

          {/* ✅ FIXED: Removed 'isLoading' prop. Using standard 'disabled' and manual children composition */}
          <Button
            onClick={handleGenerateInvite}
            disabled={isGenerating} 
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isGenerating ? (
               <div className="flex items-center gap-2">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span>Generating...</span>
               </div>
            ) : (
               <div className="flex items-center gap-2">
                 <Share2 className="w-5 h-5" />
                 <span>Generate Invite Link</span>
               </div>
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              💡 The invite link will install your strategy directly to TradingView with license protection
            </p>
          </div>
        </div>
      ) : (
        // STATE 2: Show Invite Link
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Success Message */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold text-emerald-300">Invite Link Generated!</div>
                <div className="text-sm text-emerald-400/80">Share this link to grant access to your strategy</div>
              </div>
            </div>
          </div>

          {/* Invite URL Display */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">Your TradingView Invite Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-white overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-600">
                {inviteUrl}
              </div>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* License Key Display */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">License Key</label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-blue-400 tracking-wider">
              {licenseKey}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              🔒 This key is embedded in your strategy for validation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={handleOpenTradingView}
              size="lg"
              className="bg-blue-600 hover:bg-blue-500"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>Install on TradingView</span>
              </div>
            </Button>
            <Button
              onClick={handleGenerateInvite}
              variant="outline"
              size="lg"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Generate New Link</span>
              </div>
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
            <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              How It Works
            </h4>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Share the invite link with your TradingView account</li>
              <li>Click the link to automatically install the strategy</li>
              <li>The strategy will appear in your TradingView indicators</li>
              <li>License validation happens automatically in the background</li>
              <li>You can revoke access anytime from your dashboard</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}