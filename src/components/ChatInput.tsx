import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Image, Mic, Square, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatInputProps {
  onSendMessage: (message: string, imageFile?: File, voiceBlob?: Blob) => void;
  placeholder?: string;
  disabled?: boolean;
  replyingTo?: { sender_name: string; message: string } | null;
  onClearReply?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = "Type your message...",
  disabled = false,
  replyingTo,
  onClearReply
}) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage && !voiceBlob) || disabled) return;

    onSendMessage(message, selectedImage || undefined, voiceBlob || undefined);
    setMessage('');
    setSelectedImage(null);
    setVoiceBlob(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImage(file);
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

      // Start timer (30 second limit)
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

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeVoice = () => {
    setVoiceBlob(null);
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 md:relative md:z-auto">
      <CardContent className="p-4">
        {replyingTo && (
          <div className="mb-3 p-3 bg-muted rounded-lg border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Replying to {replyingTo.sender_name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearReply}
                className="h-4 w-4 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm mt-1 truncate">{replyingTo.message}</p>
          </div>
        )}

        {/* Media Preview */}
        {(selectedImage || voiceBlob) && (
          <div className="mb-3 space-y-2">
            {selectedImage && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Image className="w-4 h-4" />
                <span className="text-sm flex-1 truncate">{selectedImage.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {voiceBlob && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Mic className="w-4 h-4" />
                <span className="text-sm flex-1">Voice message ({Math.round(voiceBlob.size / 1024)}KB)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeVoice}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "You are muted and cannot send messages" : placeholder}
            className="min-h-[80px] resize-none"
            maxLength={500}
            disabled={disabled}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || selectedImage !== null}
              >
                <Image className="w-4 h-4" />
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || voiceBlob !== null}
                className={isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}
              >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              {isRecording && (
                <span className="text-sm text-red-500 flex items-center">
                  Recording: {recordingTime}s / 30s
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {message.length}/500
              </span>
              <Button 
                type="submit" 
                disabled={disabled || (!message.trim() && !selectedImage && !voiceBlob)}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default ChatInput;