import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserPlus, MessageSquare, Users, Search, Check, X, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';
import FriendChat from './FriendChat';

interface MessagesAndFriendsProps {
  username?: string;
  onBack: () => void;
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

const MessagesAndFriends: React.FC<MessagesAndFriendsProps> = ({ username, onBack }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover' | 'chat'>('friends');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchRegisteredUsers();
      fetchFriends();
      fetchFriendRequests();
    } else {
      setLoading(false);
    }
  }, [username]);

  const fetchRegisteredUsers = async () => {
    try {
      // Get users from multiple sources for better discovery
      const [postsData, chatData, reportsData] = await Promise.all([
        supabase.from('posts').select('author_name, timestamp').order('timestamp', { ascending: false }),
        supabase.from('public_chat').select('sender_name, timestamp').order('timestamp', { ascending: false }),
        supabase.from('reports').select('guest_name, timestamp').order('timestamp', { ascending: false })
      ]);

      const allUsers = new Set<string>();
      const userTimestamps: { [key: string]: string } = {};

      // Add users from posts
      if (postsData.data) {
        postsData.data.forEach(post => {
          if (post.author_name && post.author_name !== username) {
            allUsers.add(post.author_name);
            if (!userTimestamps[post.author_name]) {
              userTimestamps[post.author_name] = post.timestamp;
            }
          }
        });
      }

      // Add users from chat
      if (chatData.data) {
        chatData.data.forEach(chat => {
          if (chat.sender_name && chat.sender_name !== username) {
            allUsers.add(chat.sender_name);
            if (!userTimestamps[chat.sender_name]) {
              userTimestamps[chat.sender_name] = chat.timestamp;
            }
          }
        });
      }

      // Add users from reports
      if (reportsData.data) {
        reportsData.data.forEach(report => {
          if (report.guest_name && report.guest_name !== username) {
            allUsers.add(report.guest_name);
            if (!userTimestamps[report.guest_name]) {
              userTimestamps[report.guest_name] = report.timestamp;
            }
          }
        });
      }

      const uniqueUsers = Array.from(allUsers).map(author_name => ({
        id: `user-${author_name}`,
        author_name,
        timestamp: userTimestamps[author_name] || new Date().toISOString()
      }));

      setRegisteredUsers(uniqueUsers.slice(0, 50)); // Show more users for better discovery
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    if (!username) return;

    try {
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('user1, user2')
        .eq('status', 'accepted')
        .or(`user1.eq.${username},user2.eq.${username}`);

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      const friendNames = friendships?.map(friendship => 
        friendship.user1 === username ? friendship.user2 : friendship.user1
      ) || [];

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

  const handleAddFriend = async (friendName: string) => {
    if (!username) {
      toast.error('Please login to add friends');
      return;
    }

    try {
      const { data: existingFriendship } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user1.eq.${username},user2.eq.${friendName}),and(user1.eq.${friendName},user2.eq.${username})`);

      if (existingFriendship && existingFriendship.length > 0) {
        toast.error('Already friends with this user');
        return;
      }

      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('*')
        .or(`and(from_user.eq.${username},to_user.eq.${friendName},type.eq.friend_request),and(from_user.eq.${friendName},to_user.eq.${username},type.eq.friend_request)`)
        .eq('read', false);

      if (existingNotifications && existingNotifications.length > 0) {
        toast.error('Friend request already exists');
        return;
      }

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
      fetchRegisteredUsers();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleAcceptFriend = async (requestId: string, fromUser: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating notification:', updateError);
        return;
      }

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

  const filteredUsers = registeredUsers.filter(user => 
    user.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedFriend) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFriend(null)}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <UserAvatar username={selectedFriend} size="sm" />
          <div>
            <h3 className="font-medium">{selectedFriend}</h3>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <div className="flex-1">
          <FriendChat username={username!} friendName={selectedFriend} onClose={() => setSelectedFriend(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold">Messages & Friends</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <Button
          variant={activeTab === 'friends' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('friends')}
          className="rounded-none border-0 flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Friends ({friends.length})
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('requests')}
          className="rounded-none border-0 flex-1"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Requests ({friendRequests.length})
        </Button>
        <Button
          variant={activeTab === 'discover' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('discover')}
          className="rounded-none border-0 flex-1"
        >
          <Search className="w-4 h-4 mr-2" />
          Discover
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'friends' && (
          <div className="space-y-2">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No friends yet. Add some from the discover tab!</p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <Card key={friend.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <UserAvatar username={friend.name} size="sm" />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(friend.status)} border-2 border-white`}></div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{friend.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{friend.status} • {friend.lastSeen}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedFriend(friend.name)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-2">
            {friendRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No friend requests</p>
              </div>
            ) : (
              friendRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar username={request.from_user} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{request.from_user}</p>
                          <p className="text-xs text-gray-500">Wants to be friends</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptFriend(request.id, request.from_user)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectFriend(request.id, request.from_user)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'discover' && (
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar username={user.author_name} size="sm" />
                        <div>
                          <p className="font-medium text-sm">{user.author_name}</p>
                          <p className="text-xs text-gray-500">Platform member</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddFriend(user.author_name)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesAndFriends;