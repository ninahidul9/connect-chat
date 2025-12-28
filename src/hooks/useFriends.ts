import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, FriendRequest, Friendship } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('friendships')
      .select('*, friend:profiles!friendships_friend_id_fkey(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching friends:', error);
      return;
    }

    const friendsList = (data as any[]).map((f) => f.friend as Profile);
    setFriends(friendsList);
  }, [user?.id]);

  const fetchFriendRequests = useCallback(async () => {
    if (!user?.id) return;

    // Fetch pending requests (received)
    const { data: received, error: receivedError } = await supabase
      .from('friend_requests')
      .select('*, from_user:profiles!friend_requests_from_user_id_fkey(*)')
      .eq('to_user_id', user.id)
      .eq('status', 'pending');

    if (receivedError) {
      console.error('Error fetching received requests:', receivedError);
    } else {
      setPendingRequests(received as FriendRequest[]);
    }

    // Fetch sent requests
    const { data: sent, error: sentError } = await supabase
      .from('friend_requests')
      .select('*, to_user:profiles!friend_requests_to_user_id_fkey(*)')
      .eq('from_user_id', user.id)
      .eq('status', 'pending');

    if (sentError) {
      console.error('Error fetching sent requests:', sentError);
    } else {
      setSentRequests(sent as FriendRequest[]);
    }
  }, [user?.id]);

  const sendFriendRequest = async (toUserId: string) => {
    if (!user?.id) return { error: new Error('Not logged in') };

    const { error } = await supabase.from('friend_requests').insert({
      from_user_id: user.id,
      to_user_id: toUserId,
    });

    if (!error) {
      await fetchFriendRequests();
    }

    return { error: error ? new Error(error.message) : null };
  };

  const acceptFriendRequest = async (requestId: string, fromUserId: string) => {
    if (!user?.id) return { error: new Error('Not logged in') };

    // Update request status
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (updateError) return { error: new Error(updateError.message) };

    // Create friendships (bidirectional)
    const { error: friendshipError } = await supabase.from('friendships').insert([
      { user_id: user.id, friend_id: fromUserId },
      { user_id: fromUserId, friend_id: user.id },
    ]);

    if (!friendshipError) {
      await fetchFriends();
      await fetchFriendRequests();
    }

    return { error: friendshipError ? new Error(friendshipError.message) : null };
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);

    if (!error) {
      await fetchFriendRequests();
    }

    return { error: error ? new Error(error.message) : null };
  };

  const removeFriend = async (friendId: string) => {
    if (!user?.id) return { error: new Error('Not logged in') };

    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

    if (!error) {
      await fetchFriends();
    }

    return { error: error ? new Error(error.message) : null };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
      setLoading(false);
    };

    loadData();
  }, [fetchFriends, fetchFriendRequests]);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to friend requests
    const requestsChannel = supabase
      .channel('friend-requests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        () => {
          fetchFriendRequests();
        }
      )
      .subscribe();

    // Subscribe to profile changes (for online status)
    const profilesChannel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updatedProfile = payload.new as Profile;
          setFriends((prev) =>
            prev.map((f) => (f.id === updatedProfile.id ? updatedProfile : f))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [user?.id, fetchFriendRequests]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests()]),
  };
};
