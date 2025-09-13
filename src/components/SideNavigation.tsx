import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, Megaphone, BookOpen, ChevronRight, UserPlus, MessageSquare, Users, Search, Check, X, MoreVertical, FileText, MessageCircle, Gamepad2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';
import AdminMessagesChat from './AdminMessagesChat';
import FriendChat from './FriendChat';
import MessagesAndFriends from './MessagesAndFriends';
import ReportsCenter from './ReportsCenter';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface SideNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  username?: string;
  onClose?: () => void;
}

interface RegisteredUser {
  id: string;
  author_name: string;
  timestamp: string;
}

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
}

interface FriendRequest {
  id: string;
  from_user: string;
  to_user: string;
  message: string;
  timestamp: string;
}

interface Report {
  id: string;
  type: string;
  description: string;
  status: string;
  timestamp: string;
  admin_response?: string;
}

interface AdminMessage {
  id: string;
  message: string;
  sender_type: string;
  timestamp: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  activeSection, 
  onSectionChange,
  username,
  onClose 
}) => {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [showMessagesAndFriends, setShowMessagesAndFriends] = useState(false);
  const [showReportsCenter, setShowReportsCenter] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'tutorials', label: 'Videos', icon: BookOpen },
  { id: 'games', label: 'Games', icon: Gamepad2, isNew: true },
  { id: 'messages-friends', label: 'Messages & Friends', icon: MessageSquare },
  { id: 'reports-center', label: 'Reports', icon: FileText },
];

  useEffect(() => {
    if (username) {
      fetchRegisteredUsers();
      fetchFriends();
      fetchFriendRequests();
      fetchReports();
      fetchAdminMessages();
    } else {
      setLoading(false);
    }

    // Listen for mobile menu toggle event
    const handleOpenSideNavigation = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-side-navigation', handleOpenSideNavigation);

    return () => {
      window.removeEventListener('open-side-navigation', handleOpenSideNavigation);
    };
  }, [username]);

  const fetchReports = async () => {
    if (!username) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('guest_name', username)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        return;
      }

      setReports(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchAdminMessages = async () => {
    if (!username) return;

    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('guest_name', username)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching admin messages:', error);
        return;
      }

      setAdminMessages(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('author_name, timestamp')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Get unique users from posts
      const uniqueUsers = data?.reduce((acc: RegisteredUser[], post) => {
        if (!acc.find(user => user.author_name === post.author_name) && post.author_name !== username) {
          acc.push({
            id: `user-${post.author_name}`,
            author_name: post.author_name,
            timestamp: post.timestamp
          });
        }
        return acc;
      }, []) || [];

      setRegisteredUsers(uniqueUsers.slice(0, 6)); // Show max 6 users
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    if (!username) return;

    try {
      // Fetch accepted friend relationships from friends table
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('user1, user2')
        .eq('status', 'accepted')
        .or(`user1.eq.${username},user2.eq.${username}`);

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      // Extract friend names
      const friendNames = friendships?.map(friendship => 
        friendship.user1 === username ? friendship.user2 : friendship.user1
      ) || [];

      // Create friend objects with mock status
      const friendsList = friendNames.map((name, index) => ({
        id: `friend-${index}`,
        name,
        status: Math.random() > 0.5 ? 'online' : 'offline' as 'online' | 'offline',
        lastSeen: Math.random() > 0.5 ? 'Now' : '2 hours ago'
      }));

      setFriends(friendsList);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchFriendRequests = async () => {
    if (!username) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('to_user', username)
        .eq('type', 'friend_request')
        .eq('read', false)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching friend requests:', error);
        return;
      }

      setFriendRequests(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

const handleSectionChange = (section: string) => {
  if (section === 'messages-friends') {
    setShowMessagesAndFriends(true);
    return;
  }
  if (section === 'reports-center') {
    setShowReportsCenter(true);
    return;
  }
  onSectionChange(section);
  setIsOpen(false); // Close mobile menu
  if (onClose) onClose();
};

  const handleAddFriend = async (friendName: string) => {
    if (!username) {
      toast.error('Please login to add friends');
      return;
    }

    try {
      // Check if they're already friends
      const { data: existingFriendship } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user1.eq.${username},user2.eq.${friendName}),and(user1.eq.${friendName},user2.eq.${username})`);

      if (existingFriendship && existingFriendship.length > 0) {
        toast.error('Already friends with this user');
        return;
      }

      // Check for existing notifications
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('*')
        .or(`and(from_user.eq.${username},to_user.eq.${friendName},type.eq.friend_request),and(from_user.eq.${friendName},to_user.eq.${username},type.eq.friend_request)`)
        .eq('read', false);

      if (existingNotifications && existingNotifications.length > 0) {
        toast.error('Friend request already exists');
        return;
      }

      // Insert friend request notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          from_user: username,
          to_user: friendName,
          type: 'friend_request',
          message: `${username} sent you a friend request`,
          read: false
        });

      if (error) {
        console.error('Error sending friend request:', error);
        toast.error('Failed to send friend request');
        return;
      }

      toast.success(`Friend request sent to ${friendName}`);
      fetchRegisteredUsers(); // Refresh the list
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleAcceptFriend = async (requestId: string, fromUser: string) => {
    try {
      // Mark the request as read
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating notification:', updateError);
        return;
      }

      // Create actual friendship in friends table
      const { error: friendError } = await supabase
        .from('friends')
        .insert({
          user1: username!,
          user2: fromUser,
          status: 'accepted'
        });

      if (friendError) {
        console.error('Error creating friendship:', friendError);
        return;
      }

      // Create friend accepted notification
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          from_user: username!,
          to_user: fromUser,
          type: 'friend_accepted',
          message: `${username} accepted your friend request`,
          read: false
        });

      if (insertError) {
        console.error('Error creating acceptance notification:', insertError);
        return;
      }

      toast.success(`You are now friends with ${fromUser}`);
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const handleRejectFriend = async (requestId: string, fromUser: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting friend request:', error);
        return;
      }

      toast.success(`Friend request from ${fromUser} rejected`);
      fetchFriendRequests();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to reject friend request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showMessagesAndFriends) {
    return (
      <MessagesAndFriends 
        username={username} 
        onBack={() => setShowMessagesAndFriends(false)} 
      />
    );
  }

  if (showReportsCenter) {
    return (
      <ReportsCenter 
        username={username} 
        onBack={() => setShowReportsCenter(false)} 
      />
    );
  }

  const renderNavigationContent = () => {
    if (!username) {
      return (
        <div className="h-full overflow-y-auto bg-white p-4 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full justify-start gap-3 relative ${
                    isActive 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.isNew && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Button>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Login Required</h3>
              <p className="text-gray-500">Please login to access community features and connect with friends.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto bg-white p-4 space-y-4">
        {/* Main Navigation */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full justify-start gap-3 relative ${
                  isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.isNew && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Button>
            );
          })}
        </div>

        {/* Reports & Admin Messages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Your Reports & Admin Messages ({reports.length + adminMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {reports.length === 0 && adminMessages.length === 0 ? (
              <div className="text-center py-4">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No reports or messages yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {reports.map((report) => (
                  <div key={report.id} className="p-2 rounded-lg bg-blue-50 border">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          Report: {report.type}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          Status: {report.status}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        report.status === 'resolved' ? 'bg-green-500' : 
                        report.status === 'in_progress' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
                {adminMessages.map((message) => (
                  <AdminMessagesChat key={message.id} guestName={username!} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Friend Requests ({friendRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border">
                    <div className="flex items-center gap-2">
                      <UserAvatar username={request.from_user} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">{request.from_user}</p>
                        <p className="text-xs text-gray-500">Friend request</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptFriend(request.id, request.from_user)}
                        className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRejectFriend(request.id, request.from_user)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Friends */}
        {friends.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Search friends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Your Friends ({filteredFriends.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">
                  {searchTerm ? 'No friends found matching your search.' : 'No friends yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="relative">
                        <UserAvatar username={friend.name} size="sm" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${getStatusColor(friend.status)} rounded-full border border-white`}></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-medium text-gray-900 truncate">{friend.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {friend.status} • {friend.lastSeen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                        <MessageSquare className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Friends Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Suggested Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-sm text-gray-500">Loading users...</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {registeredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <UserAvatar username={user.author_name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{user.author_name}</p>
                        <p className="text-xs text-gray-500">Platform Member</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs px-2 py-1 h-6"
                      onClick={() => handleAddFriend(user.author_name)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
                {registeredUsers.length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-4">
                    No registered users found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-80 p-0">
          {renderNavigationContent()}
        </SheetContent>
      </Sheet>
      <div className="hidden md:block">
        {renderNavigationContent()}
      </div>
    </>
  );
};

export default SideNavigation;