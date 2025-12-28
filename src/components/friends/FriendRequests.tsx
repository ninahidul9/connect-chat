import React from 'react';
import { Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FriendRequest, Profile } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendRequestsProps {
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onAccept: (requestId: string, fromUserId: string) => void;
  onDecline: (requestId: string) => void;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({
  pendingRequests,
  sentRequests,
  onAccept,
  onDecline,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (pendingRequests.length === 0 && sentRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No requests</p>
        <p className="text-xs text-muted-foreground">
          Friend requests will appear here
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {pendingRequests.length > 0 && (
          <div className="mb-4">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Received — {pendingRequests.length}
            </h3>
            <AnimatePresence mode="popLayout">
              {pendingRequests.map((request) => {
                const fromUser = request.from_user as Profile | undefined;
                if (!fromUser) return null;

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={fromUser.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(fromUser.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {fromUser.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{fromUser.username}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-success hover:bg-success/10"
                        onClick={() => onAccept(request.id, fromUser.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => onDecline(request.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {sentRequests.length > 0 && (
          <div>
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sent — {sentRequests.length}
            </h3>
            {sentRequests.map((request) => {
              const toUser = request.to_user as Profile | undefined;
              if (!toUser) return null;

              return (
                <div
                  key={request.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={toUser.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(toUser.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {toUser.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{toUser.username}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                    Pending
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default FriendRequests;
