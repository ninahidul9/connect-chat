import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserSearch } from '@/hooks/useUserSearch';
import { Profile, FriendRequest } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

interface UserSearchProps {
  friends: Profile[];
  sentRequests: FriendRequest[];
  pendingRequests: FriendRequest[];
  onSendRequest: (userId: string) => Promise<{ error: Error | null }>;
}

const UserSearch: React.FC<UserSearchProps> = ({
  friends,
  sentRequests,
  pendingRequests,
  onSendRequest,
}) => {
  const [query, setQuery] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const { results, loading, search, clearResults } = useUserSearch();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, search, clearResults]);

  const getStatus = (userId: string): 'friend' | 'sent' | 'received' | 'none' => {
    if (friends.some((f) => f.id === userId)) return 'friend';
    if (sentRequests.some((r) => r.to_user_id === userId)) return 'sent';
    if (pendingRequests.some((r) => r.from_user_id === userId)) return 'received';
    return 'none';
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    await onSendRequest(userId);
    setSendingTo(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {!query ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Find friends</p>
            <p className="text-xs text-muted-foreground">
              Search for users to add as friends
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No users found matching "{query}"
            </p>
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence mode="popLayout">
              {results.map((user) => {
                const status = getStatus(user.id);

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(user.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                    {status === 'friend' ? (
                      <span className="text-xs text-success px-2 py-1 bg-success/10 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Friends
                      </span>
                    ) : status === 'sent' ? (
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                        Pending
                      </span>
                    ) : status === 'received' ? (
                      <span className="text-xs text-primary px-2 py-1 bg-primary/10 rounded-full">
                        Accept?
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-primary hover:bg-primary/10"
                        onClick={() => handleSendRequest(user.id)}
                        disabled={sendingTo === user.id}
                      >
                        {sendingTo === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default UserSearch;
