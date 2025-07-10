
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

interface Report {
  id: string;
  type: string;
  description: string;
  guest_name: string;
  screenshot_url: string | null;
  timestamp: string;
  admin_response: string | null;
  admin_response_timestamp: string | null;
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

const AdminPanel: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [selectedGuest, setSelectedGuest] = useState('');
  const [newAdminMessage, setNewAdminMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [reportsRes, publicRes, privateRes, adminRes] = await Promise.all([
        supabase.from('reports').select('*').order('timestamp', { ascending: false }),
        supabase.from('public_chat').select('*').order('timestamp', { ascending: false }),
        supabase.from('private_chats').select('*').order('timestamp', { ascending: false }),
        supabase.from('admin_messages').select('*').order('timestamp', { ascending: false })
      ]);

      if (reportsRes.error) console.error('Reports error:', reportsRes.error);
      else setReports(reportsRes.data || []);

      if (publicRes.error) console.error('Public chat error:', publicRes.error);
      else setPublicMessages(publicRes.data || []);

      if (privateRes.error) console.error('Private chat error:', privateRes.error);
      else setPrivateMessages(privateRes.data || []);

      if (adminRes.error) console.error('Admin messages error:', adminRes.error);
      else setAdminMessages(adminRes.data || []);

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
      setSelectedReport(null);
      fetchAllData();
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

      toast.success("Message sent to user");
      setNewAdminMessage('');
      fetchAllData();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const getPrivateChat = () => {
    if (!player1 || !player2) return [];
    return privateMessages.filter(msg => 
      (msg.sender_name === player1 && msg.receiver_name === player2) ||
      (msg.sender_name === player2 && msg.receiver_name === player1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="public-chat">Public Chat</TabsTrigger>
          <TabsTrigger value="private-chat">Private Chat</TabsTrigger>
          <TabsTrigger value="messages">Admin Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>All Reports ({reports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded cursor-pointer hover:bg-muted/50 ${
                        selectedReport?.id === report.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          by {report.guest_name}
                        </span>
                        {report.admin_response && (
                          <Badge>Responded</Badge>
                        )}
                      </div>
                      <p className="text-sm truncate">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(report.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedReport && (
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
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
                  
                  {selectedReport.admin_response && (
                    <div>
                      <strong>Previous Response:</strong>
                      <p className="mt-1 text-sm bg-primary/10 p-2 rounded">
                        {selectedReport.admin_response}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Responded: {formatTime(selectedReport.admin_response_timestamp!)}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleRespondToReport} className="space-y-4">
                    <Textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Type your response..."
                      rows={4}
                    />
                    <Button type="submit" className="w-full">
                      Send Response
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="public-chat">
          <Card>
            <CardHeader>
              <CardTitle>Public Chat History ({publicMessages.length} messages)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto border rounded p-4 bg-muted/50">
                {publicMessages.map((msg) => (
                  <div key={msg.id} className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-primary">{msg.sender_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm mt-1">{msg.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="private-chat">
          <Card>
            <CardHeader>
              <CardTitle>Private Chat Viewer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Player 1 name"
                  value={player1}
                  onChange={(e) => setPlayer1(e.target.value)}
                />
                <Input
                  placeholder="Player 2 name"
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                />
              </div>
              
              {player1 && player2 && (
                <div className="h-96 overflow-y-auto border rounded p-4 bg-muted/50">
                  <h3 className="font-semibold mb-4">
                    Chat between {player1} and {player2}
                  </h3>
                  {getPrivateChat().map((msg) => (
                    <div key={msg.id} className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-primary">{msg.sender_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm mt-1">{msg.message}</div>
                    </div>
                  ))}
                  {getPrivateChat().length === 0 && (
                    <div className="text-center text-muted-foreground">
                      No messages found between these players.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Guest</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a guest to message" />
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
                      placeholder="Type your message to the guest..."
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
