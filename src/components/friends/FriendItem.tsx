import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Profile } from '@/types/database';
import { motion } from 'framer-motion';

interface FriendItemProps {
  friend: Profile;
  isSelected: boolean;
  unreadCount?: number;
  onClick: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({
  friend,
  isSelected,
  unreadCount = 0,
  onClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
        'hover:bg-sidebar-accent',
        isSelected && 'bg-sidebar-accent'
      )}
    >
      <div className="relative">
        <Avatar className="h-11 w-11">
          <AvatarImage src={friend.avatar_url || ''} alt={friend.display_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
            {getInitials(friend.display_name)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-sidebar',
            friend.is_online ? 'bg-online' : 'bg-offline'
          )}
        />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sidebar-foreground truncate text-sm">
            {friend.display_name}
          </span>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate block">
          @{friend.username}
        </span>
      </div>
    </motion.button>
  );
};

export default FriendItem;
