import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MessageCircle, Users } from 'lucide-react';
import ChatInput from './ChatInput';
import { supabase } from '@/integrations/supabase/client';
import UserAvatar from './UserAvatar';
import { toast } from 'sonner';

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

  const handleSendMessage = async (message: string, imageFile?: File, voiceBlob?: Blob) => {
    if ((!message.trim() && !imageFile && !voiceBlob) || !targetPlayer) return;

    try {
      let imageUrl = '';
      let voiceUrl = '';

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `private_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
        
        imageUrl = data.publicUrl;
      }

      // Upload voice if provided
      if (voiceBlob) {
        const fileName = `private_voice_${Date.now()}.webm`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, voiceBlob);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);
        
        voiceUrl = data.publicUrl;
      }

      // Create message with content
      let messageContent = message.trim();
      if (imageUrl) messageContent += `\n[IMAGE:${imageUrl}]`;
      if (voiceUrl) messageContent += `\n[VOICE:${voiceUrl}]`;

      const messageData = {
        sender_name: guestName,
        receiver_name: targetPlayer,
        message: messageContent,
      };

      const { error } = await supabase
        .from('private_chats')
        .insert([messageData]);

      if (error) throw error;

      scrollToBottom();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderMessage = (messageText: string) => {
    // Check for image links
    const imageMatch = messageText.match(/\[IMAGE:(.*?)\]/);
    const voiceMatch = messageText.match(/\[VOICE:(.*?)\]/);
    
    let displayText = messageText.replace(/\[IMAGE:.*?\]/, '').replace(/\[VOICE:.*?\]/, '').trim();
    
    return (
      <div>
        {displayText && <div className="text-sm break-words">{displayText}</div>}
        {imageMatch && (
          <img 
            src={imageMatch[1]} 
            alt="Shared image" 
            className="mt-2 max-w-full h-auto rounded-lg border"
            style={{ maxHeight: '200px' }}
          />
        )}
        {voiceMatch && (
          <audio controls className="mt-2 w-full max-w-xs">
            <source src={voiceMatch[1]} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    );
  };

  if (!chatStarted) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Start 1-on-1 Chat
            </CardTitle>
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
    <div className="container mx-auto p-4 pb-32 max-w-4xl">
      <Card className="h-[calc(100vh-240px)] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Chat with {targetPlayer}
            </CardTitle>
            <Button variant="outline" onClick={() => setChatStarted(false)}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.sender_name === guestName ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender_name !== guestName && (
                    <UserAvatar username={msg.sender_name} size="sm" />
                  )}
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender_name === guestName 
                      ? 'bg-blue-500 text-white rounded-br-sm' 
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                  }`}>
                    {msg.sender_name !== guestName && (
                      <div className="font-semibold text-sm text-blue-600 mb-1">
                        {msg.sender_name}
                      </div>
                    )}
                    {renderMessage(msg.message)}
                    <div className={`text-xs mt-1 ${
                      msg.sender_name === guestName ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  {msg.sender_name === guestName && (
                    <UserAvatar username={msg.sender_name} size="sm" />
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Message Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            placeholder="Type your message..."
            disabled={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateChat;