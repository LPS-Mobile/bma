import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useBots() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBots(data || []);
    } catch (err: any) {
      console.error('Error fetching bots:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  return { bots, loading, error, refresh: fetchBots };
}

export function useBot(botId: string) {
  const [bot, setBot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBot = useCallback(async () => {
    if (!botId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

      if (error) throw error;
      setBot(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => {
    fetchBot();
  }, [fetchBot]);

  return { bot, loading, error, refresh: fetchBot };
}

// ✅ ADDED THIS EXPORT TO FIX THE CRASH
export function useBotOperations() {
    const supabase = createClient();

    const updateBot = async (id: string, updates: any) => {
        const { error } = await supabase.from('bots').update(updates).eq('id', id);
        return !error;
    };

    const deleteBot = async (id: string) => {
        const { error } = await supabase.from('bots').delete().eq('id', id);
        return !error;
    };

    return { updateBot, deleteBot };
}