import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Send, Image, Mic, Square, X, Reply, Smile, MessageCircle,
  RefreshCw, Trash2, Users, ChevronUp, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UserAvatar from './UserAvatar';
import { toast } from "sonner";

interface Message {
  id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  reply_to_id?: string;
  reactions?: Record<string, string[]>;
}

interface ModernPublicChatProps {
  guestName: string;
}

const ModernPublicChat: React.FC<ModernPublicChatProps> = ({ guestName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    checkMuteStatus();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('modern_public_chat_changes')
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
      const { data } = await supabase
        .from('muted_users')
        .select('*')
        .eq('username', guestName)
        .single();

      if (data) setIsMuted(true);
    } catch (error) {
      // User is not muted
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

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedImage && !voiceBlob) || isMuted) return;

    try {
      let imageUrl = '';
      let voiceUrl = '';

      // Upload image if provided
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, selectedImage);

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

      // Reset form
      setMessage('');
      setSelectedImage(null);
      setVoiceBlob(null);
      setReplyingTo(null);
      setShowInput(false);
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
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

  const renderMessage = (messageText: string) => {
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      
      {/* Header */}
      <div className="relative z-10 p-4 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Public Chat</h2>
              <p className="text-sm text-gray-600">
                Connected as {guestName}
                {isMuted && <span className="text-red-500 ml-2">(Muted)</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => fetchMessages()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {messages.map((msg) => {
          const replyToMessage = msg.reply_to_id 
            ? messages.find(m => m.id === msg.reply_to_id)
            : null;
            
          return (
            <div key={msg.id} className="group animate-fade-in">
              <div className={`flex gap-3 ${msg.sender_name === guestName ? 'justify-end' : 'justify-start'}`}>
                {msg.sender_name !== guestName && (
                  <UserAvatar username={msg.sender_name} size="sm" className="mt-1" />
                )}
                
                <div className={`max-w-xs sm:max-w-sm md:max-w-md relative ${
                  msg.sender_name === guestName ? 'order-2' : ''
                }`}>
                  {/* Reply indicator */}
                  {replyToMessage && (
                    <div className={`text-xs p-2 mb-1 rounded-lg border-l-2 ${
                      msg.sender_name === guestName 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'bg-gray-50 border-gray-300 text-gray-600'
                    }`}>
                      <div className="font-medium">{replyToMessage.sender_name}</div>
                      <div className="truncate">{replyToMessage.message}</div>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.sender_name === guestName
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border rounded-bl-md'
                  }`}>
                    {msg.sender_name !== guestName && (
                      <div className="font-semibold text-sm text-blue-600 mb-1">
                        {msg.sender_name}
                      </div>
                    )}
                    
                    {renderMessage(msg.message)}
                    
                    <div className={`text-xs mt-2 ${
                      msg.sender_name === guestName ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  
                  {/* Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(msg.reactions).map(([emoji, users]) => 
                        users.length > 0 && (
                          <button
                            key={emoji}
                            className={`text-sm px-3 py-1.5 rounded-full border transition-all hover:scale-105 ${
                              users.includes(guestName)
                                ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                            }`}
                            onClick={() => addReaction(msg.id, emoji)}
                          >
                            {emoji} {users.length}
                          </button>
                        )
                      )}
                    </div>
                  )}
                  
                  {/* Message actions */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -right-12 top-2 flex flex-col gap-1 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm"
                      onClick={() => setReplyingTo(msg)}
                    >
                      <Reply className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-sm"
                      onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)}
                    >
                      <Smile className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Horizontal sliding emoji picker under message */}
                  {showEmojiPicker === msg.id && (
                    <div className="mt-2 animate-slide-in-right">
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['❤️', '👍', '😂', '😮', '😢', '😡', '🔥', '💯', '🎉', '👀'].map((emoji) => (
                          <Button
                            key={emoji}
                            size="sm"
                            variant="ghost"
                            className="p-2 h-10 w-10 flex-shrink-0 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
                            onClick={() => {
                              addReaction(msg.id, emoji);
                              setShowEmojiPicker(null);
                            }}
                          >
                            <span className="text-lg">{emoji}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {msg.sender_name === guestName && (
                  <UserAvatar username={msg.sender_name} size="sm" className="mt-1" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern chat input area - always visible */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm border-t p-4 shadow-2xl">
        {/* Reply indicator */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-600">
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
            <p className="text-sm mt-1 truncate text-gray-700">{replyingTo.message}</p>
          </div>
        )}

        {/* Media previews */}
        {(selectedImage || voiceBlob) && (
          <div className="mb-3 space-y-2">
            {selectedImage && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Image className="w-4 h-4" />
                <span className="text-sm flex-1 truncate">{selectedImage.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {voiceBlob && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Mic className="w-4 h-4" />
                <span className="text-sm flex-1">Voice message ({Math.round(voiceBlob.size / 1024)}KB)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setVoiceBlob(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action buttons above input */}
        <div className="bg-white border rounded-lg p-3 mb-3 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {/* Image upload */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isMuted || selectedImage !== null}
                className="flex items-center gap-1 border-2 border-blue-300 hover:bg-blue-50 text-blue-600"
              >
                <Image className="w-4 h-4" />
                <span className="text-xs">Image</span>
              </Button>
              
              {/* Voice recording */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isMuted || voiceBlob !== null}
                className={`flex items-center gap-1 border-2 ${isRecording 
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                  : 'border-green-300 hover:bg-green-50 text-green-600'
                }`}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-xs">{isRecording ? 'Stop' : 'Voice'}</span>
              </Button>
              
              {isRecording && (
                <span className="text-sm text-red-500 flex items-center font-medium">
                  Recording: {recordingTime}s / 30s
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {message.length}/500
              </span>
              <Button 
                onClick={handleSendMessage}
                disabled={isMuted || (!message.trim() && !selectedImage && !voiceBlob)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-1 border-0 text-white font-medium"
              >
                <Send className="w-4 h-4" />
                <span className="text-xs">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isMuted ? "You are muted and cannot send messages" : "Type your message..."}
            className="min-h-[80px] resize-none border-2 border-gray-300 focus:border-blue-500 w-full rounded-lg p-3 text-base"
            maxLength={500}
            disabled={isMuted}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
              }
              setSelectedImage(file);
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ModernPublicChat;