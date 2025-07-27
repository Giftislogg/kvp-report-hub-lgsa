
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface PrivateChatProps {
  guestName: string;
  initialTarget?: string;
}

interface PrivateMessage {
  id: string;
  sender_name: string;
  receiver_name: string;
  message: string;
  timestamp: string;
  reply_to_id?: string;
  reactions?: Record<string, string[]>;
}

const PrivateChat: React.FC<PrivateChatProps> = ({ guestName, initialTarget }) => {
  const [targetPlayer, setTargetPlayer] = useState(initialTarget || '');
  const [chatStarted, setChatStarted] = useState(!!initialTarget);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<PrivateMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (initialTarget) {
      setTargetPlayer(initialTarget);
      setChatStarted(true);
    }
  }, [initialTarget]);

  useEffect(() => {
    if (chatStarted && targetPlayer) {
      fetchMessages();
      
      // Subscribe to real-time updates for this chat
      const channel = supabase
        .channel('private-chat-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'private_chats'
          },
          (payload) => {
            const newMsg = payload.new as PrivateMessage;
            // Only add if it's part of this conversation
            if ((newMsg.sender_name === guestName && newMsg.receiver_name === targetPlayer) ||
                (newMsg.sender_name === targetPlayer && newMsg.receiver_name === guestName)) {
              setMessages(prev => [...prev, newMsg]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatStarted, targetPlayer, guestName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('private_chats')
        .select('*')
        .or(`and(sender_name.eq.${guestName},receiver_name.eq.${targetPlayer}),and(sender_name.eq.${targetPlayer},receiver_name.eq.${guestName})`)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error("Failed to load messages");
        return;
      }

      const typedMessages: PrivateMessage[] = (data || []).map(msg => ({
        ...msg,
        reactions: msg.reactions as Record<string, string[]> || {}
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    }
  };

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPlayer.trim()) {
      toast.error("Please enter a player name");
      return;
    }
    
    if (targetPlayer.trim() === guestName) {
      toast.error("You cannot chat with yourself");
      return;
    }

    // Send chat request notification
    try {
      await supabase
        .from('notifications')
        .insert({
          to_user: targetPlayer.trim(),
          from_user: guestName,
          type: 'chat_request',
          message: `${guestName} wants to start a private chat with you.`
        });
      
      toast.success(`Chat request sent to ${targetPlayer.trim()}`);
      setChatStarted(true);
    } catch (error) {
      console.error('Error sending chat request:', error);
      toast.error("Failed to send chat request");
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('private_chats')
        .insert({
          sender_name: guestName,
          receiver_name: targetPlayer,
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!chatStarted) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Start 1-on-1 Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={startChat} className="space-y-4">
              <div>
                <Label htmlFor="targetPlayer">Player Name</Label>
                <Input
                  id="targetPlayer"
                  value={targetPlayer}
                  onChange={(e) => setTargetPlayer(e.target.value)}
                  placeholder="Enter the player's name"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Chat Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-24">
      <Card className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chat with {targetPlayer}</CardTitle>
            <Button variant="outline" onClick={() => setChatStarted(false)}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 bg-muted/50">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`mb-3 flex items-start gap-2 ${msg.sender_name === guestName ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender_name !== guestName && (
                    <UserAvatar username={msg.sender_name} size="sm" />
                  )}
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    msg.sender_name === guestName 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-xs">
                        {msg.sender_name === guestName ? 'You' : msg.sender_name}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                  {msg.sender_name === guestName && (
                    <UserAvatar username={msg.sender_name} size="sm" />
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateChat;
