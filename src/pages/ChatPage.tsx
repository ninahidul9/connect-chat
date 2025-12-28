import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  MessageCircle,
  Users,
  UserPlus,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/hooks/useFriends';
import { useMessages } from '@/hooks/useMessages';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import FriendsList from '@/components/friends/FriendsList';
import FriendRequests from '@/components/friends/FriendRequests';
import UserSearch from '@/components/friends/UserSearch';
import ChatWindow from '@/components/chat/ChatWindow';
import { Profile } from '@/types/database';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPage: React.FC = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'requests' | 'search'>('chats');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const {
    friends,
    pendingRequests,
    sentRequests,
    loading: friendsLoading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
  } = useFriends();

  const { messages, loading: messagesLoading, sendMessage, markAsRead } = useMessages(
    selectedFriend?.id || null
  );

  const { unreadCounts, totalUnread } = useUnreadMessages();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSendRequest = async (userId: string) => {
    const { error } = await sendFriendRequest(userId);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Request sent',
        description: 'Friend request sent successfully.',
      });
    }
    return { error };
  };

  const handleAcceptRequest = async (requestId: string, fromUserId: string) => {
    const { error } = await acceptFriendRequest(requestId, fromUserId);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Request accepted',
        description: 'You are now friends!',
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const { error } = await declineFriendRequest(requestId);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSelectFriend = (friend: Profile) => {
    setSelectedFriend(friend);
    setMobileSheetOpen(false);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">ChatFlow</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)}>
          <TabsList className="w-full grid grid-cols-3 bg-sidebar-accent">
            <TabsTrigger value="chats" className="relative">
              <Users className="w-4 h-4" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              <Bell className="w-4 h-4" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="search">
              <UserPlus className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        {sidebarTab === 'chats' && (
          <FriendsList
            friends={friends}
            selectedFriendId={selectedFriend?.id || null}
            unreadCounts={unreadCounts}
            loading={friendsLoading}
            onSelectFriend={handleSelectFriend}
          />
        )}
        {sidebarTab === 'requests' && (
          <FriendRequests
            pendingRequests={pendingRequests}
            sentRequests={sentRequests}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        )}
        {sidebarTab === 'search' && (
          <UserSearch
            friends={friends}
            sentRequests={sentRequests}
            pendingRequests={pendingRequests}
            onSendRequest={handleSendRequest}
          />
        )}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                  {profile ? getInitials(profile.display_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.display_name || 'Loading...'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{profile?.username || '...'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 border-r border-border">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card flex items-center px-4">
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">ChatFlow</span>
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col md:h-screen h-[calc(100vh-3.5rem)] md:mt-0 mt-14">
        <ChatWindow
          friend={selectedFriend}
          messages={messages}
          loading={messagesLoading}
          onSendMessage={handleSendMessage}
          onMarkAsRead={markAsRead}
          onBack={() => setSelectedFriend(null)}
          showBackButton={!!selectedFriend}
        />
      </main>
    </div>
  );
};

export default ChatPage;
