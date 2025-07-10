
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Users, Bell, RefreshCw, UserPlus, Send, FileText, X, CheckCircle } from "lucide-react";

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
  updated_at?: string;
}

interface AdminMessage {
  id: string;
  guest_name: string;
  message: string;
  sender_type: 'admin' | 'user';
  timestamp: string;
}

interface Report {
  id: string;
  type: string;
  description: string;
  guest_name: string;
  screenshot_url: string | null;
  timestamp: string;
  admin_response: string | null;
  admin_response_timestamp: string | null;
  status: string | null;
}

interface UserSuggestion {
  username: string;
  last_seen: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ username, onNavigate }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchUserReports();
    fetchUserSuggestions();
    
    // Subscribe to friends updates
    const friendsChannel = supabase
      .channel('friends-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'friends'
      }, () => {
        fetchFriends();
        fetchFriendRequests();
      })
      .subscribe();

    // Subscribe to reports updates
    const reportsChannel = supabase
      .channel('reports-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports'
      }, (payload) => {
        const updatedReport = payload.new as Report;
        if (updatedReport && updatedReport.guest_name === username) {
          fetchUserReports();
          
          // If admin responded, show notification
          if (payload.eventType === 'UPDATE' && updatedReport.admin_response) {
            toast.success("Admin replied to your report!");
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(friendsChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, [username]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await (supabase as any)
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
      const { data, error } = await (supabase as any)
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

  const fetchUserReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('guest_name', username)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching user reports:', error);
        return;
      }

      setUserReports(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchUserSuggestions = async () => {
    try {
      // Get unique usernames from various tables to suggest friends
      const [publicChatUsers, privateChatUsers, reportsUsers] = await Promise.all([
        supabase.from('public_chat').select('sender_name').order('timestamp', { ascending: false }).limit(50),
        supabase.from('private_chats').select('sender_name, receiver_name').order('timestamp', { ascending: false }).limit(50),
        supabase.from('reports').select('guest_name').order('timestamp', { ascending: false }).limit(50)
      ]);

      const allUsers = new Set<string>();
      
      // Add users from public chat
      publicChatUsers.data?.forEach(user => {
        if (user.sender_name && user.sender_name !== username) {
          allUsers.add(user.sender_name);
        }
      });

      // Add users from private chats
      privateChatUsers.data?.forEach(chat => {
        if (chat.sender_name && chat.sender_name !== username) {
          allUsers.add(chat.sender_name);
        }
        if (chat.receiver_name && chat.receiver_name !== username) {
          allUsers.add(chat.receiver_name);
        }
      });

      // Add users from reports
      reportsUsers.data?.forEach(report => {
        if (report.guest_name && report.guest_name !== username) {
          allUsers.add(report.guest_name);
        }
      });

      // Get existing friends and pending requests to exclude them
      const { data: existingConnections } = await (supabase as any)
        .from('friends')
        .select('user1, user2')
        .or(`user1.eq.${username},user2.eq.${username}`);

      const connectedUsers = new Set<string>();
      existingConnections?.forEach((conn: any) => {
        connectedUsers.add(conn.user1 === username ? conn.user2 : conn.user1);
      });

      // Filter out already connected users
      const suggestions = Array.from(allUsers)
        .filter(user => !connectedUsers.has(user))
        .slice(0, 10)
        .map(user => ({ username: user, last_seen: 'Recently active' }));

      setUserSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await Promise.all([fetchFriends(), fetchFriendRequests(), fetchUserReports(), fetchUserSuggestions()]);
    setIsLoading(false);
    toast.success("Refreshed!");
  };

  const sendFriendRequest = async (targetUsername: string) => {
    try {
      // Check if friendship already exists
      const { data: existingFriend } = await (supabase as any)
        .from('friends')
        .select('*')
        .or(`and(user1.eq.${username},user2.eq.${targetUsername}),and(user1.eq.${targetUsername},user2.eq.${username})`)
        .single();

      if (existingFriend) {
        toast.error("Friend request already exists or you're already friends");
        return;
      }

      const { error } = await (supabase as any)
        .from('friends')
        .insert({
          user1: username,
          user2: targetUsername,
          requested_by: username,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending friend request:', error);
        toast.error("Failed to send friend request");
        return;
      }

      toast.success(`Friend request sent to ${targetUsername}`);
      fetchUserSuggestions(); // Refresh suggestions
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error("Failed to send friend request");
    }
  };

  const handleFriendRequest = async (friendId: string, accept: boolean) => {
    try {
      if (accept) {
        await (supabase as any)
          .from('friends')
          .update({ status: 'accepted', updated_at: new Date().toISOString() })
          .eq('id', friendId);
        
        toast.success("Friend request accepted!");
      } else {
        await (supabase as any)
          .from('friends')
          .update({ status: 'declined' })
          .eq('id', friendId);
        
        toast.success("Friend request declined");
      }
      
      fetchFriends();
      fetchFriendRequests();
      fetchUserSuggestions();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error("Failed to handle friend request");
    }
  };

  const sendReplyToReport = async () => {
    if (!selectedReport || !newReply.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          guest_name: username,
          message: newReply.trim(),
          sender_type: 'user'
        });

      if (error) {
        console.error('Error sending reply:', error);
        toast.error("Failed to send reply");
        return;
      }

      toast.success("Reply sent to admin");
      setNewReply('');
      setSelectedReport(null);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error("Failed to send reply");
    }
  };

  const closeReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to close this report?')) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'closed' })
        .eq('id', reportId);

      if (error) {
        console.error('Error closing report:', error);
        toast.error("Failed to close report");
        return;
      }

      toast.success("Report closed");
      fetchUserReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error closing report:', error);
      toast.error("Failed to close report");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getFriendName = (friend: Friend) => {
    return friend.user1 === username ? friend.user2 : friend.user1;
  };

  const getStatusBadge = (report: Report) => {
    if (report.status === 'closed') {
      return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
    }
    if (report.admin_response) {
      return <Badge className="bg-green-100 text-green-800">Admin Replied</Badge>;
    }
    return <Badge variant="secondary">Open</Badge>;
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

        {/* User Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Suggested Friends ({userSuggestions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userSuggestions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No friend suggestions available
                </p>
              ) : (
                userSuggestions.map((user) => (
                  <div key={user.username} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.last_seen}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(user.username)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </Button>
                  </div>
                ))
              )}
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
                  No friends yet. Add some from the suggestions above!
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

        {/* Your Reports & Admin Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Reports & Admin Messages ({userReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No reports submitted yet
                </p>
              ) : (
                <div className="space-y-3">
                  {userReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.type}</Badge>
                          {getStatusBadge(report)}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(report.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                      
                      {report.admin_response && (
                        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <Badge variant="destructive">Admin Response</Badge>
                            <span className="text-xs text-gray-500">
                              {formatTime(report.admin_response_timestamp!)}
                            </span>
                          </div>
                          <p className="text-sm">{report.admin_response}</p>
                        </div>
                      )}

                      {selectedReport?.id === report.id && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Reply to admin..."
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              rows={3}
                              className="flex-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={sendReplyToReport}
                              className="flex-1"
                              disabled={!newReply.trim()}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send Reply
                            </Button>
                            {report.status !== 'closed' && (
                              <Button
                                onClick={() => closeReport(report.id)}
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Close Report
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
