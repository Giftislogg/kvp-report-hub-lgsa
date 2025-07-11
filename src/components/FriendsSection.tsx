
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, MessageCircle, Search, MoreVertical, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface FriendsSectionProps {
  username?: string;
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

const FriendsSection: React.FC<FriendsSectionProps> = ({ username }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchFriends();
      fetchFriendRequests();
    } else {
      setLoading(false);
    }
  }, [username]);

  const fetchFriends = async () => {
    if (!username) return;

    try {
      // Fetch accepted friend relationships
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('from_user, to_user')
        .eq('type', 'friend_accepted')
        .or(`from_user.eq.${username},to_user.eq.${username}`);

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      // Extract friend names
      const friendNames = notifications?.map(notif => 
        notif.from_user === username ? notif.to_user : notif.from_user
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
    } finally {
      setLoading(false);
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

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (!username) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community & Friends</h1>
          <p className="text-gray-600">Please login to view and manage your friends</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Login Required</h3>
            <p className="text-gray-500">You need to be logged in to access the community features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community & Friends</h1>
          <p className="text-gray-600">Loading your friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community & Friends</h1>
        <p className="text-gray-600">Connect and chat with your KVRP friends</p>
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Friend Requests ({friendRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border">
                  <div className="flex items-center gap-3">
                    <UserAvatar username={request.from_user} size="md" />
                    <div>
                      <h3 className="font-medium text-gray-900">{request.from_user}</h3>
                      <p className="text-sm text-gray-500">{request.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Friends ({filteredFriends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No friends found matching your search.' : 'No friends yet. Check your friend requests or find friends in the side navigation!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserAvatar username={friend.name} size="md" />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(friend.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{friend.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {friend.status} • {friend.lastSeen}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsSection;
