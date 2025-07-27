
import React from 'react';
import ModernPublicChat from './ModernPublicChat';

interface ChatSectionProps {
  guestName: string;
}

interface ChatGroup {
  id: string;
  name: string;
  members: string[];
  lastMessage: string;
  timestamp: string;
  unread: number;
  isPublic?: boolean;
}

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ guestName }) => {
  return <ModernPublicChat guestName={guestName} />;
};

export default ChatSection;
