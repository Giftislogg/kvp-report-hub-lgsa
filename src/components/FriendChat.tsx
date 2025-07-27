import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface PrivateMessage {
  id: string;
  sender_name: string;
  receiver_name: string;
  message: string;
  timestamp: string;
  reply_to_id?: string;
  reactions?: Record<string, string[]>;
}

interface FriendChatProps {
  username: string;
  friendName: string;
  onClose: () => void;
}

const FriendChat: React.FC<FriendChatProps> = ({ username, friendName, onClose }) => {
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<PrivateMessage | null>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`private-chat-${username}-${friendName}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'private_chats',
        filter: `or(and(sender_name.eq.${username},receiver_name.eq.${friendName}),and(sender_name.eq.${friendName},receiver_name.eq.${username}))`
      }, (payload) => {
        const newMsg = {
          ...payload.new,
          reactions: payload.new.reactions as Record<string, string[]> || {}
        } as PrivateMessage;
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username, friendName]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('private_chats')
        .select('*')
        .or(`and(sender_name.eq.${username},receiver_name.eq.${friendName}),and(sender_name.eq.${friendName},receiver_name.eq.${username})`)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const typedMessages: PrivateMessage[] = (data || []).map(msg => ({
        ...msg,
        reactions: msg.reactions as Record<string, string[]> || {}
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('private_chats')
        .insert({
          sender_name: username,
          receiver_name: friendName,
          message: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserAvatar username={friendName} size="sm" />
            Chat with {friendName}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 text-xs py-4">Start a conversation with {friendName}</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.sender_name === username ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender_name !== username && (
                  <UserAvatar username={message.sender_name} size="sm" />
                )}
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-xs ${
                    message.sender_name === username
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="mb-1">{message.message}</p>
                  <p className={`text-xs ${
                    message.sender_name === username ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.sender_name === username && (
                  <UserAvatar username={username} size="sm" />
                )}
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${friendName}...`}
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

export default FriendChat;