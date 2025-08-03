import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface SuggestedFriendsProps {
  username?: string;
}

interface PlatformUser {
  username: string;
  lastActivity: string;
  isOnline: boolean;
}

const SuggestedFriends: React.FC<SuggestedFriendsProps> = ({ username }) => {
  const [suggestedUsers, setSuggestedUsers] = useState<PlatformUser[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchPlatformUsers();
      fetchExistingConnections();
    }
  }, [username]);

  const fetchPlatformUsers = async () => {
    try {
      // Get users from various platform activities
      const [publicChatData, postsData, reportsData] = await Promise.all([
        supabase.from('public_chat').select('sender_name').order('timestamp', { ascending: false }).limit(50),
        supabase.from('posts').select('author_name').order('timestamp', { ascending: false }).limit(30),
        supabase.from('reports').select('guest_name').order('timestamp', { ascending: false }).limit(20)
      ]);

      const allUsers = new Set<string>();
      
      // Collect unique usernames
      publicChatData.data?.forEach(user => user.sender_name && allUsers.add(user.sender_name));
      postsData.data?.forEach(post => post.author_name && allUsers.add(post.author_name));
      reportsData.data?.forEach(report => report.guest_name && allUsers.add(report.guest_name));

      // Remove current user and create platform users
      allUsers.delete(username!);
      
      const platformUsers = Array.from(allUsers).slice(0, 8).map(user => ({
        username: user,
        lastActivity: 'Recently active',
        isOnline: Math.random() > 0.3 // Simulate online status
      }));

      setSuggestedUsers(platformUsers);
    } catch (error) {
      console.error('Error fetching platform users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingConnections = async () => {
    if (!username) return;

    try {
      // Get existing friends
      const { data: friendships } = await supabase
        .from('friends')
        .select('user1, user2')
        .eq('status', 'accepted')
        .or(`user1.eq.${username},user2.eq.${username}`);

      const friendNames = new Set(
        friendships?.map(f => f.user1 === username ? f.user2 : f.user1) || []
      );
      setFriends(friendNames);

      // Get pending friend requests
      const { data: requests } = await supabase
        .from('notifications')
        .select('to_user')
        .eq('from_user', username)
        .eq('type', 'friend_request')
        .eq('read', false);

      const pendingRequests = new Set(requests?.map(r => r.to_user) || []);
      setSentRequests(pendingRequests);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleAddFriend = async (friendName: string) => {
    if (!username) {
      toast.error('Please login to add friends');
      return;
    }

    try {
      // Check if already connected
      if (friends.has(friendName)) {
        toast.error('Already friends with this user');
        return;
      }

      if (sentRequests.has(friendName)) {
        toast.error('Friend request already sent');
        return;
      }

      // Send friend request
      const { error } = await supabase
        .from('notifications')
        .insert({
          from_user: username,
          to_user: friendName,
          type: 'friend_request',
          message: `${username} sent you a friend request`,
          read: false
        });

      if (error) throw error;

      setSentRequests(prev => new Set([...prev, friendName]));
      toast.success(`Friend request sent to ${friendName}`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleRemoveSuggestion = (userToRemove: string) => {
    setSuggestedUsers(prev => prev.filter(user => user.username !== userToRemove));
    toast.success('User removed from suggestions');
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading suggestions...</div>;
  }

  if (suggestedUsers.length === 0) {
    return <div className="text-center py-4 text-gray-500">No suggestions available</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {suggestedUsers.map((user) => {
        const isFriend = friends.has(user.username);
        const requestSent = sentRequests.has(user.username);
        
        return (
          <div key={user.username} className="flex items-center justify-between p-3 rounded-lg border bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="relative">
                <UserAvatar username={user.username} size="sm" />
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{user.username}</p>
                <p className="text-xs text-gray-500">{user.lastActivity}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {isFriend ? (
                <Button size="sm" variant="outline" disabled className="text-green-600 border-green-200">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Friends
                </Button>
              ) : requestSent ? (
                <Button size="sm" variant="outline" disabled className="text-blue-600 border-blue-200">
                  <UserPlus className="w-3 h-3 mr-1" />
                  Sent
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => handleAddFriend(user.username)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleRemoveSuggestion(user.username)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedFriends;