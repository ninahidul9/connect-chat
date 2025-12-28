import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useUserSearch = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!user?.id || !query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching users:', error);
      setResults([]);
    } else {
      setResults(data as Profile[]);
    }
    setLoading(false);
  }, [user?.id]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    loading,
    search,
    clearResults,
  };
};
