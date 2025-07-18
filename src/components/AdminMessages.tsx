
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminMessagesProps {
  guestName: string;
}

interface AdminMessage {
  id: string;
  guest_name: string;
  message: string;
  sender_type: string;
  timestamp: string;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ guestName }) => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time updates for this user's messages
    const channel = supabase
      .channel('admin-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages'
        },
        (payload) => {
          const newMsg = payload.new as AdminMessage;
          if (newMsg.guest_name === guestName) {
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guestName]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('guest_name', guestName)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error("Failed to load messages");
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          guest_name: guestName,
          message: newMessage.trim(),
          sender_type: 'user'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message");
        return;
      }

      setNewMessage('');
      toast.success("Message sent to administrators");
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center">Loading messages...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Messages with Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto border rounded p-4 mb-4 bg-muted/50">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No messages yet. Send a message to administrators below.
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`mb-4 ${msg.sender_type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.sender_type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-destructive/10 border border-destructive/20'
                  }`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-xs">
                        {msg.sender_type === 'user' ? 'You' : 'Administrator'}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={sendMessage} className="space-y-4">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message to administrators..."
              rows={3}
            />
            <Button type="submit" className="w-full">
              Send Message to Administrators
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessages;
