
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Trash2, Users } from "lucide-react";

interface Message {
  id: string;
  sender_name: string;
  message: string;
  timestamp: string;
}

interface PublicChatProps {
  guestName: string;
}

const PublicChat: React.FC<PublicChatProps> = ({ guestName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('public_chat_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'public_chat' }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'public_chat' }, (payload) => {
        const deletedId = payload.old.id;
        setMessages(prev => prev.filter(msg => msg.id !== deletedId));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('public_chat')
        .select('*')
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
        .from('public_chat')
        .insert({
          sender_name: guestName,
          message: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message");
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const deleteMessage = async (messageId: string) => {
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
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const clearChatHistory = async () => {
    if (!confirm('Are you sure you want to clear your chat history? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('public_chat')
        .delete()
        .eq('sender_name', guestName);

      if (error) {
        console.error('Error clearing chat history:', error);
        toast.error("Failed to clear chat history");
        return;
      }

      toast.success("Your chat history has been cleared");
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading chat...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Card className="h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Public Chat
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Connected as {guestName}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {messages.length} messages
            </Badge>
            <Button
              onClick={clearChatHistory}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear My History
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className={`flex ${message.sender_name === guestName ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                    message.sender_name === guestName
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                  }`}>
                    {message.sender_name !== guestName && (
                      <div className="font-semibold text-sm text-blue-600 mb-1">
                        {message.sender_name}
                      </div>
                    )}
                    <div className="text-sm md:text-base break-words">
                      {message.message}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.sender_name === guestName ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                  {/* Admin delete button */}
                  {isAdmin && (
                    <Button
                      onClick={() => deleteMessage(message.id)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                maxLength={500}
              />
              <Button type="submit" className="px-6">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="text-xs text-gray-500 mt-2">
              {newMessage.length}/500 characters
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicChat;
