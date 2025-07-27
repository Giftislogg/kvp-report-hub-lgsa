
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Plus, MoreHorizontal, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from './UserAvatar';

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
