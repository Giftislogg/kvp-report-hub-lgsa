import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Archive, UserX, Megaphone, X, CheckCircle, Send } from "lucide-react";

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

interface PublicMessage {
  id: string;
  sender_name: string;
  message: string;
  timestamp: string;
}

interface PrivateMessage {
  id: string;
  sender_name: string;
  receiver_name: string;
  message: string;
  timestamp: string;
}

interface AdminMessage {
  id: string;
  guest_name: string;
  message: string;
  sender_type: string;
  timestamp: string;
}

interface Post {
  id: string;
  author_name: string;
  title: string;
  content: string;
  likes: number;
  timestamp: string;
}

interface UserSuggestion {
  username: string;
  last_seen: string;
}

const AdminPanel: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportReplies, setReportReplies] = useState<AdminMessage[]>([]);
  const [adminResponse, setAdminResponse] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [selectedGuest, setSelectedGuest] = useState('');
  const [newAdminMessage, setNewAdminMessage] = useState('');
  const [muteUsername, setMuteUsername] = useState('');
  const [muteReason, setMuteReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    fetchUserSuggestions();

    // Subscribe to real-time updates for admin messages (user replies)
    const messagesChannel = supabase
      .channel('admin-messages-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'admin_messages'
      }, (payload) => {
        console.log('Admin message update:', payload);
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as AdminMessage;
          // If it's a user reply and we have a selected report for this user
          if (newMessage.sender_type === 'user' && selectedReport && newMessage.guest_name === selectedReport.guest_name) {
            setReportReplies(prev => [...prev, newMessage]);
            toast.success(`New reply from ${newMessage.guest_name}`);
          }
        }
        fetchAllData(); // Refresh all data to keep everything in sync
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedReport]);

  // Fetch replies for the selected report
  useEffect(() => {
    if (selectedReport) {
      fetchReportReplies(selectedReport.guest_name);
    } else {
      setReportReplies([]);
    }
  }, [selectedReport]);

  const fetchReportReplies = async (guestName: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('guest_name', guestName)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching report replies:', error);
        return;
      }

      setReportReplies(data || []);
    } catch (error) {
      console.error('Unexpected error fetching report replies:', error);
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
        if (user.sender_name) {
          allUsers.add(user.sender_name);
        }
      });

      // Add users from private chats
      privateChatUsers.data?.forEach(chat => {
        if (chat.sender_name) {
          allUsers.add(chat.sender_name);
        }
        if (chat.receiver_name) {
          allUsers.add(chat.receiver_name);
        }
      });

      // Add users from reports
      reportsUsers.data?.forEach(report => {
        if (report.guest_name) {
          allUsers.add(report.guest_name);
        }
      });

      const suggestions = Array.from(allUsers)
        .slice(0, 10)
        .map(user => ({ username: user, last_seen: 'Recently active' }));

      setUserSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };

  const removeSuggestion = (username: string) => {
    setUserSuggestions(prev => prev.filter(suggestion => suggestion.username !== username));
    toast.success("Suggestion removed");
  };

  const fetchAllData = async () => {
    try {
      const [reportsRes, publicRes, privateRes, adminRes, postsRes] = await Promise.all([
        supabase.from('reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('public_chat').select('*').order('timestamp', { ascending: false }),
        supabase.from('private_chats').select('*').order('timestamp', { ascending: false }),
        supabase.from('admin_messages').select('*').order('timestamp', { ascending: false }),
        supabase.from('posts').select('*').order('timestamp', { ascending: false })
      ]);

      if (reportsRes.error) console.error('Reports error:', reportsRes.error);
      else setReports(reportsRes.data || []);

      if (publicRes.error) console.error('Public chat error:', publicRes.error);
      else setPublicMessages(publicRes.data || []);

      if (privateRes.error) console.error('Private chat error:', privateRes.error);
      else setPrivateMessages(privateRes.data || []);

      if (adminRes.error) console.error('Admin messages error:', adminRes.error);
      else setAdminMessages(adminRes.data || []);

      if (postsRes.error) console.error('Posts error:', postsRes.error);
      else setPosts(postsRes.data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !adminResponse.trim()) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          admin_response: adminResponse.trim(),
          admin_response_timestamp: new Date().toISOString()
        })
        .eq('id', selectedReport.id);

      if (error) {
        console.error('Error updating report:', error);
        toast.error("Failed to update report");
        return;
      }

      toast.success("Report response saved");
      setAdminResponse('');
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
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
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error("Failed to delete report");
        return;
      }

      toast.success("Report deleted");
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const deletePublicMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('public_chat')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        toast.error("Failed to delete message");
        return;
      }

      toast.success("Message deleted");
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        toast.error("Failed to delete post");
        return;
      }

      toast.success("Post deleted");
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const muteUser = async () => {
    if (!muteUsername.trim()) {
      toast.error("Please enter a username to mute");
      return;
    }

    try {
      const { error } = await supabase
        .from('muted_users')
        .insert({
          username: muteUsername.trim(),
          muted_by: 'admin',
          reason: muteReason.trim() || 'No reason provided'
        });

      if (error) {
        console.error('Error muting user:', error);
        toast.error("Failed to mute user");
        return;
      }

      toast.success(`User ${muteUsername} has been muted`);
      setMuteUsername('');
      setMuteReason('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const sendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuest || !newAdminMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          guest_name: selectedGuest,
          message: newAdminMessage.trim(),
          sender_type: 'admin'
        });

      if (error) {
        console.error('Error sending admin message:', error);
        toast.error("Failed to send message");
        return;
      }

      // Also add to report replies if we have a selected report for this guest
      if (selectedReport && selectedReport.guest_name === selectedGuest) {
        setReportReplies(prev => [...prev, {
          id: Date.now().toString(),
          guest_name: selectedGuest,
          message: newAdminMessage.trim(),
          sender_type: 'admin',
          timestamp: new Date().toISOString()
        }]);
      }

      toast.success("Message sent to user");
      setNewAdminMessage('');
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const getUniqueGuests = () => {
    const guests = new Set<string>();
    adminMessages.forEach(msg => guests.add(msg.guest_name));
    reports.forEach(report => guests.add(report.guest_name));
    return Array.from(guests).sort();
  };

  const getGuestMessages = () => {
    if (!selectedGuest) return [];
    return adminMessages.filter(msg => msg.guest_name === selectedGuest);
  };

  const getPrivateChat = () => {
    if (!player1 || !player2) return [];
    return privateMessages.filter(msg => 
      (msg.sender_name === player1 && msg.receiver_name === player2) ||
      (msg.sender_name === player2 && msg.receiver_name === player1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading admin panel...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-lg mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Control Panel</h1>
        <p className="text-red-100">Manage reports, monitor chats, moderate posts, and communicate with users</p>
      </div>
      
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="public-chat">Public Chat</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Reports ({reports.length})</span>
                  <Badge variant="secondary">{reports.filter(r => !r.admin_response).length} pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedReport?.id === report.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {report.guest_name}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {report.admin_response && (
                            <Badge className="bg-green-100 text-green-800">Responded</Badge>
                          )}
                          {report.status === 'closed' && (
                            <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm truncate mb-2">{report.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(report.timestamp)}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeReport(report.id);
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 py-1 h-auto"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Close
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReport(report.id);
                            }}
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Report Details & Conversation</span>
                    {selectedReport.status === 'closed' ? (
                      <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
                    ) : (
                      <Badge variant="destructive">Open</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>Type:</strong> {selectedReport.type}
                  </div>
                  <div>
                    <strong>Guest:</strong> {selectedReport.guest_name}
                  </div>
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1 text-sm bg-muted p-2 rounded">
                      {selectedReport.description}
                    </p>
                  </div>
                  {selectedReport.screenshot_url && (
                    <div>
                      <strong>Screenshot:</strong>
                      <img 
                        src={selectedReport.screenshot_url} 
                        alt="Report screenshot" 
                        className="mt-1 max-w-full h-auto rounded border"
                      />
                    </div>
                  )}
                  <div>
                    <strong>Submitted:</strong> {formatTime(selectedReport.timestamp)}
                  </div>

                  {/* Conversation thread */}
                  <div className="border-t pt-4">
                    <strong className="block mb-3">Conversation:</strong>
                    <div className="h-64 overflow-y-auto border rounded p-4 bg-muted/50 space-y-3">
                      {reportReplies.length === 0 ? (
                        <p className="text-muted-foreground text-center">No conversation yet</p>
                      ) : (
                        reportReplies.map((reply) => (
                          <div key={reply.id} className={`flex ${reply.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              reply.sender_type === 'admin' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-blue-100 text-blue-900 border'
                            }`}>
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-xs">
                                  {reply.sender_type === 'admin' ? 'Admin' : reply.guest_name}
                                </span>
                                <span className="text-xs opacity-70">
                                  {formatTime(reply.timestamp)}
                                </span>
                              </div>
                              <div className="text-sm">{reply.message}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Admin response form */}
                  <form onSubmit={handleRespondToReport} className="space-y-4 border-t pt-4">
                    <Textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Type your response..."
                      rows={4}
                    />
                    <div className="flex flex-col gap-2">
                      <Button type="submit" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => closeReport(selectedReport.id)}
                          variant="outline"
                          className="flex-1 text-blue-600 hover:text-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Close Report
                        </Button>
                        <Button
                          type="button"
                          onClick={() => deleteReport(selectedReport.id)}
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete Report
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="public-chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Public Chat History ({publicMessages.length} messages)</span>
                <Badge variant="secondary">Admin Mode</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto border rounded p-4 bg-muted/50">
                {publicMessages.map((msg) => (
                  <div key={msg.id} className="mb-3 group flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-primary">{msg.sender_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm mt-1">{msg.message}</div>
                    </div>
                    <Button
                      onClick={() => deletePublicMessage(msg.id)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Community Posts ({posts.length} posts)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {post.author_name} • {formatTime(post.timestamp)} • {post.likes} likes
                        </p>
                      </div>
                      <Button
                        onClick={() => deletePost(post.id)}
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  User Moderation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Username to mute"
                    value={muteUsername}
                    onChange={(e) => setMuteUsername(e.target.value)}
                  />
                  <Input
                    placeholder="Reason (optional)"
                    value={muteReason}
                    onChange={(e) => setMuteReason(e.target.value)}
                  />
                </div>
                <Button onClick={muteUser} className="w-full">
                  <UserX className="w-4 h-4 mr-2" />
                  Mute User from Public Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Suggestions ({userSuggestions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userSuggestions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No user suggestions available
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
                          variant="outline"
                          onClick={() => removeSuggestion(user.username)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Send Message to User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user to message" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUniqueGuests().map((guest) => (
                      <SelectItem key={guest} value={guest}>
                        {guest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedGuest && (
              <Card>
                <CardHeader>
                  <CardTitle>Messages with {selectedGuest}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-64 overflow-y-auto border rounded p-4 bg-muted/50">
                    {getGuestMessages().map((msg) => (
                      <div key={msg.id} className={`mb-3 ${msg.sender_type === 'admin' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          msg.sender_type === 'admin' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted border'
                        }`}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-xs">
                              {msg.sender_type === 'admin' ? 'Admin' : msg.guest_name}
                            </span>
                            <span className="text-xs opacity-70">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm">{msg.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={sendAdminMessage} className="space-y-4">
                    <Textarea
                      value={newAdminMessage}
                      onChange={(e) => setNewAdminMessage(e.target.value)}
                      placeholder="Type your message to the user..."
                      rows={3}
                    />
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
