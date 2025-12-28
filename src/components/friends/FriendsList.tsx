import React from 'react';
import { Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import FriendItem from './FriendItem';
import { Profile } from '@/types/database';

interface FriendsListProps {
  friends: Profile[];
  selectedFriendId: string | null;
  unreadCounts: Record<string, number>;
  loading: boolean;
  onSelectFriend: (friend: Profile) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  selectedFriendId,
  unreadCounts,
  loading,
  onSelectFriend,
}) => {
  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No friends yet</p>
        <p className="text-xs text-muted-foreground">
          Search for users to add friends
        </p>
      </div>
    );
  }

  // Sort friends: online first, then by name
  const sortedFriends = [...friends].sort((a, b) => {
    if (a.is_online !== b.is_online) return b.is_online ? 1 : -1;
    return a.display_name.localeCompare(b.display_name);
  });

  const onlineFriends = sortedFriends.filter((f) => f.is_online);
  const offlineFriends = sortedFriends.filter((f) => !f.is_online);

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {onlineFriends.length > 0 && (
          <div className="mb-4">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Online — {onlineFriends.length}
            </h3>
            <div className="space-y-0.5">
              {onlineFriends.map((friend) => (
                <FriendItem
                  key={friend.id}
                  friend={friend}
                  isSelected={selectedFriendId === friend.id}
                  unreadCount={unreadCounts[friend.id]}
                  onClick={() => onSelectFriend(friend)}
                />
              ))}
            </div>
          </div>
        )}

        {offlineFriends.length > 0 && (
          <div>
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Offline — {offlineFriends.length}
            </h3>
            <div className="space-y-0.5">
              {offlineFriends.map((friend) => (
                <FriendItem
                  key={friend.id}
                  friend={friend}
                  isSelected={selectedFriendId === friend.id}
                  unreadCount={unreadCounts[friend.id]}
                  onClick={() => onSelectFriend(friend)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default FriendsList;
