import React, { useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Profile, Message } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  friend: Profile | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (content: string) => void;
  onMarkAsRead: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  friend,
  messages,
  loading,
  onSendMessage,
  onMarkAsRead,
  onBack,
  showBackButton = false,
}) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (friend) {
      onMarkAsRead();
    }
  }, [friend, messages.length]);

  if (!friend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircleIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Select a conversation
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Choose a friend from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={friend.avatar_url || ''} alt={friend.display_name} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(friend.display_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">
            {friend.display_name}
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                friend.is_online ? 'bg-online' : 'bg-offline'
              )}
            />
            {friend.is_online ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  i % 2 === 0 ? 'justify-start' : 'justify-end'
                )}
              >
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-muted-foreground text-sm">
              No messages yet. Say hi!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isSent={message.sender_id === user?.id}
              />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={onSendMessage} />
    </div>
  );
};

const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export default ChatWindow;
