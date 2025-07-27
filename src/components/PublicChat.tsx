
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Trash2, Users, RefreshCw, Reply, Smile, X } from "lucide-react";
import UserAvatar from './UserAvatar';

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
  const [newMessage, setNewMessage] = useState('');
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isMuted) return;

    try {
      const { error } = await supabase
        .from('public_chat')
        .insert({
          sender_name: guestName,
          message: newMessage.trim(),
          reply_to_id: replyingTo?.id || null
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error("Failed to send message");
        return;
      }

      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
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
                          {message.sender_name}
                        </div>
                      )}
                      
                      <div className="text-sm md:text-base break-words">
                        {message.message}
                      </div>
                      
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

          {/* Message Input */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-10 md:relative md:bg-transparent md:border-0 md:z-auto">
            {replyingTo && (
              <div className="mb-2 p-2 bg-muted rounded-lg border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Replying to {replyingTo.sender_name}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReplyingTo(null)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm mt-1 truncate">{replyingTo.message}</p>
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isMuted ? "You are muted and cannot send messages" : replyingTo ? `Reply to ${replyingTo.sender_name}...` : "Type your message..."}
                className="flex-1"
                maxLength={500}
                disabled={isMuted}
              />
              <Button type="submit" className="px-6" disabled={isMuted}>
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
