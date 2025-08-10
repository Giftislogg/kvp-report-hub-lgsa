import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Reply, Heart, Smile, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UserAvatar from './UserAvatar';
import NameWithBadges from './NameWithBadges';
import ChatInput from './ChatInput';
import { toast } from "sonner";

interface Message {
  id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  reply_to_id?: string;
  reactions?: Record<string, string[]>;
}

interface PublicChatProps {
  guestName: string;
}

const PublicChat: React.FC<PublicChatProps> = ({ guestName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    checkMuteStatus();
    
    // Subscribe to new messages for real-time updates
    const channel = supabase
      .channel('public_chat_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'public_chat' }, (payload) => {
        const newMsg = {
          ...payload.new,
          reactions: payload.new.reactions as Record<string, string[]> || {}
        } as Message;
        setMessages(prev => [...prev, newMsg]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'public_chat' }, (payload) => {
        const updatedMsg = {
          ...payload.new,
          reactions: payload.new.reactions as Record<string, string[]> || {}
        } as Message;
        setMessages(prev => prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg));
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

  const checkMuteStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('muted_users')
        .select('*')
        .eq('username', guestName)
        .single();

      if (data) {
        setIsMuted(true);
      }
    } catch (error) {
      // User is not muted, which is fine
    }
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

      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        reactions: msg.reactions as Record<string, string[]> || {}
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
    toast.success("Chat refreshed!");
  };

  const handleSendMessage = async (message: string, imageFile?: File, voiceBlob?: Blob) => {
    if ((!message.trim() && !imageFile && !voiceBlob) || isMuted) return;

    try {
      let imageUrl = '';
      let voiceUrl = '';

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
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
        const fileName = `voice_${Date.now()}.webm`;
        
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
        message: messageContent,
        sender_name: guestName,
        reply_to_id: replyingTo?.id || null,
      };

      const { error } = await supabase
        .from('public_chat')
        .insert([messageData]);

      if (error) throw error;

      setReplyingTo(null);
      scrollToBottom();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const currentReactions = message.reactions || {};
      const emojiReactions = currentReactions[emoji] || [];
      
      const updatedReactions = emojiReactions.includes(guestName)
        ? { ...currentReactions, [emoji]: emojiReactions.filter(name => name !== guestName) }
        : { ...currentReactions, [emoji]: [...emojiReactions, guestName] };

      const { error } = await supabase
        .from('public_chat')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating reaction:', error);
        toast.error("Failed to add reaction");
      }
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

  const renderMessage = (messageText: string) => {
    // Check for image links
    const imageMatch = messageText.match(/\[IMAGE:(.*?)\]/);
    const voiceMatch = messageText.match(/\[VOICE:(.*?)\]/);
    
    let displayText = messageText.replace(/\[IMAGE:.*?\]/, '').replace(/\[VOICE:.*?\]/, '').trim();
    
    return (
      <div>
        {displayText && <div className="text-sm md:text-base break-words">{displayText}</div>}
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
    <div className="container mx-auto p-4 md:p-6 max-w-4xl pb-32">
      <Card className="h-[calc(100vh-240px)] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Public Chat
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Connected as {guestName}
              {isMuted && <span className="text-red-500 ml-2">(Muted)</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
            {messages.map((message) => {
              const replyToMessage = message.reply_to_id 
                ? messages.find(m => m.id === message.reply_to_id)
                : null;
                
              return (
                <div key={message.id} className="group">
                  <div className={`flex items-start gap-2 ${message.sender_name === guestName ? 'justify-end' : 'justify-start'}`}>
                    {message.sender_name !== guestName && (
                      <UserAvatar username={message.sender_name} size="sm" />
                    )}
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl relative ${
                      message.sender_name === guestName
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border'
                    }`}>
                      {replyToMessage && (
                        <div className={`text-xs p-2 mb-2 rounded border-l-2 ${
                          message.sender_name === guestName 
                            ? 'bg-blue-400 border-blue-200' 
                            : 'bg-gray-100 border-gray-300'
                        }`}>
                          <div className="font-medium">{replyToMessage.sender_name}</div>
                          <div className="truncate">{replyToMessage.message}</div>
                        </div>
                      )}
                      
                      {message.sender_name !== guestName && (
                        <div className="font-semibold text-sm text-blue-600 mb-1">
                          <NameWithBadges username={message.sender_name} />
                        </div>
                      )}
                      
                      {renderMessage(message.message)}
                      
                      {/* Reactions */}
                      {message.reactions && Object.keys(message.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(message.reactions).map(([emoji, users]) => 
                            users.length > 0 && (
                              <span
                                key={emoji}
                                className={`text-xs px-2 py-1 rounded-full border cursor-pointer ${
                                  users.includes(guestName)
                                    ? 'bg-blue-100 border-blue-300'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                }`}
                                onClick={() => addReaction(message.id, emoji)}
                              >
                                {emoji} {users.length}
                              </span>
                            )
                          )}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-1 ${
                        message.sender_name === guestName ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                      
                      {/* Message Actions */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -right-16 top-2 flex gap-1 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => setReplyingTo(message)}
                        >
                          <Reply className="w-3 h-3" />
                        </Button>
                        <div className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              const emojiPicker = e.currentTarget.nextElementSibling as HTMLElement;
                              emojiPicker?.classList.toggle('hidden');
                            }}
                          >
                            <Smile className="w-3 h-3" />
                          </Button>
                          <div className="hidden absolute top-8 right-0 bg-white border rounded-lg shadow-lg p-2 z-10">
                            {['❤️', '😂', '👍', '👎', '😮', '😢'].map((emoji) => (
                              <button
                                key={emoji}
                                className="hover:bg-gray-100 p-1 rounded"
                                onClick={() => {
                                  addReaction(message.id, emoji);
                                  const emojiPicker = document.querySelector('.absolute.top-8') as HTMLElement;
                                  emojiPicker?.classList.add('hidden');
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {message.sender_name === guestName && (
                      <UserAvatar username={message.sender_name} size="sm" />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            placeholder={replyingTo ? `Reply to ${replyingTo.sender_name}...` : "Type your message..."}
            disabled={isMuted}
            replyingTo={replyingTo}
            onClearReply={() => setReplyingTo(null)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicChat;