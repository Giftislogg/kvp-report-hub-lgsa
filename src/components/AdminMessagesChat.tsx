import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface AdminMessage {
  id: string;
  guest_name: string;
  message: string;
  sender_type: string;
  timestamp: string;
}

interface AdminMessagesChatProps {
  guestName: string;
}

const AdminMessagesChat: React.FC<AdminMessagesChatProps> = ({ guestName }) => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (guestName) {
      fetchMessages();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel(`admin-messages-${guestName}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'admin_messages',
          filter: `guest_name=eq.${guestName}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as AdminMessage]);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
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
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
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
        toast.error('Failed to send message');
        return;
      }

      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const latestMessage = messages[messages.length - 1];

  if (!isExpanded) {
    return (
      <div 
        className="p-2 rounded-lg bg-green-50 border cursor-pointer hover:bg-green-100 transition-colors"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">
              Admin Chat
            </p>
            <p className="text-xs text-gray-500 truncate">
              {latestMessage ? latestMessage.message : 'Click to open chat'}
            </p>
          </div>
          <MessageCircle className="w-3 h-3 text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Admin Chat
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 text-xs py-4">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender_type === 'admin' && (
                  <UserAvatar username="Admin" size="sm" />
                )}
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-xs ${
                    message.sender_type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="mb-1">{message.message}</p>
                  <p className={`text-xs ${
                    message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.sender_type === 'user' && (
                  <UserAvatar username={guestName} size="sm" />
                )}
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-xs"
          />
          <Button type="submit" size="sm">
            <Send className="w-3 h-3" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminMessagesChat;