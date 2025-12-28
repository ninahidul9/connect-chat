import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useMessages = (friendId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user?.id || !friendId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, [user?.id, friendId]);

  const sendMessage = async (content: string) => {
    if (!user?.id || !friendId || !content.trim()) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: friendId,
      content: content.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async () => {
    if (!user?.id || !friendId) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', friendId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!user?.id || !friendId) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === friendId) ||
            (newMessage.sender_id === friendId && newMessage.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, friendId]);

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
};
