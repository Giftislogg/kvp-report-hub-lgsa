
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Users, Bell, RefreshCw, UserPlus, Send } from "lucide-react";

interface NotificationsPageProps {
  username: string;
  onNavigate: (page: string, data?: any) => void;
}

interface Friend {
  id: string;
  user1: string;
  user2: string;
  status: 'pending' | 'accepted' | 'declined';
  requested_by: string;
  created_at: string;
}

interface AdminMessage {
  id: string;
  guest_name: string;
  message: string;
  sender_type: 'admin' | 'user';
  timestamp: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ username, onNavigate }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchAdminMessages();
    
    // Subscribe to friends updates
    const friendsChannel = supabase
      .channel('friends-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'friends',
        filter: `user1=eq.${username},user2=eq.${username}`
      }, () => {
        fetchFriends();
        fetchFriendRequests();
      })
      .subscribe();

    // Subscribe to admin messages
    const messagesChannel = supabase
      .channel('admin-messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'admin_messages',
        filter: `guest_name=eq.${username}`
      }, () => {
        fetchAdminMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(friendsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [username]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user1.eq.${username},user2.eq.${username}`)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      setFriends(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('user2', username)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching friend requests:', error);
        return;
      }

      setFriendRequests(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchAdminMessages = async () => {
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

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchFriends(), fetchFriendRequests(), fetchAdminMessages()]);
    setIsLoading(false);
    toast.success("Refreshed!");
  };

  const sendFriendRequest = async () => {
    if (!newFriendUsername.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (newFriendUsername === username) {
      toast.error("You cannot send a friend request to yourself");
      return;
    }

    try {
      // Check if friendship already exists
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user1.eq.${username},user2.eq.${newFriendUsername}),and(user1.eq.${newFriendUsername},user2.eq.${username})`)
        .single();

      if (existingFriend) {
        toast.error("Friend request already exists or you're already friends");
        return;
      }

      const { error } = await supabase
        .from('friends')
        .insert({
          user1: username,
          user2: newFriendUsername,
          requested_by: username,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending friend request:', error);
        toast.error("Failed to send friend request");
        return;
      }

      toast.success(`Friend request sent to ${newFriendUsername}`);
      setNewFriendUsername('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error("Failed to send friend request");
    }
  };

  const handleFriendRequest = async (friendId: string, accept: boolean) => {
    try {
      if (accept) {
        await supabase
          .from('friends')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', friendId);
        
        toast.success("Friend request accepted!");
      } else {
        await supabase
          .from('friends')
          .update({ status: 'declined' })
          .eq('id', friendId);
        
        toast.success("Friend request declined");
      }
      
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error("Failed to handle friend request");
    }
  };

  const sendMessageToAdmin = async () => {
    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          guest_name: username,
          message: newMessage,
          sender_type: 'user'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message");
        return;
      }

      toast.success("Message sent to admin");
      setNewMessage('');
      fetchAdminMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getFriendName = (friend: Friend) => {
    return friend.user1 === username ? friend.user2 : friend.user1;
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="space-y-6">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Send Friend Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Send Friend Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter username"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendFriendRequest()}
              />
              <Button onClick={sendFriendRequest}>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Friend Requests ({friendRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{request.user1} wants to be your friend</p>
                        <p className="text-xs text-gray-500">{formatTime(request.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleFriendRequest(request.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFriendRequest(request.id, false)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Friends ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {friends.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No friends yet. Send some friend requests!
                </p>
              ) : (
                friends.map((friend) => (
                  <Button
                    key={friend.id}
                    variant="outline"
                    onClick={() => onNavigate('private-chat', { targetPlayer: getFriendName(friend) })}
                    className="w-full justify-start"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with {getFriendName(friend)}
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages with Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Send Message to Admin */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message to admin..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessageToAdmin()}
                />
                <Button onClick={sendMessageToAdmin}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>

              {/* Messages History */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adminMessages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No messages with admin yet
                  </p>
                ) : (
                  adminMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender_type === 'admin' 
                          ? 'bg-red-50 border-l-4 border-red-400' 
                          : 'bg-blue-50 border-l-4 border-blue-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant={message.sender_type === 'admin' ? 'destructive' : 'default'}>
                          {message.sender_type === 'admin' ? 'Admin' : 'You'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
