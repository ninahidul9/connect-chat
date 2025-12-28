import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchUnreadCounts = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread counts:', error);
      return;
    }

    const counts: Record<string, number> = {};
    data.forEach((msg) => {
      counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
    });
    setUnreadCounts(counts);
  }, [user?.id]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchUnreadCounts]);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return {
    unreadCounts,
    totalUnread,
    refetch: fetchUnreadCounts,
  };
};
