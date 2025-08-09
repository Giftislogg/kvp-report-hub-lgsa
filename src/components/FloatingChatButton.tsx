import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import ModernPublicChat from './ModernPublicChat';

interface FloatingChatButtonProps {
  guestName: string;
  onOpenChange?: (open: boolean) => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ guestName, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-20 left-4 z-50">
        <Button
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            onOpenChange?.(next);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-4 md:inset-8 lg:left-1/4 lg:right-8 lg:top-8 lg:bottom-8 bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Public Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsOpen(false); onOpenChange?.(false); }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ModernPublicChat guestName={guestName} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;