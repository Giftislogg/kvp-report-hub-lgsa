
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Plus, MoreHorizontal, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from './UserAvatar';

interface ChatSectionProps {
  username?: string;
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

const ChatSection: React.FC<ChatSectionProps> = ({ username }) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);

  // Initialize with GTAMO IS FOREVER public group
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([
    {
      id: 'gtamo-forever',
      name: 'GTAMO IS FOREVER',
      members: ['everyone'],
      lastMessage: 'Welcome to the official KVRP community chat!',
      timestamp: '1 hour ago',
      unread: 3,
      isPublic: true
    }
  ]);

  useEffect(() => {
    if (username) {
      fetchFriends();
    }
  }, [username]);

  const fetchFriends = async () => {
    if (!username) return;

    try {
      // Fetch accepted friend requests where user is either sender or receiver
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('from_user, to_user')
        .eq('type', 'friend_accepted')
        .or(`from_user.eq.${username},to_user.eq.${username}`);

      if (error) {
        console.error('Error fetching friends:', error);
        return;
      }

      // Extract friend names
      const friendNames = notifications?.map(notif => 
        notif.from_user === username ? notif.to_user : notif.from_user
      ) || [];

      // Create friend objects with mock status
      const friendsList = friendNames.map((name, index) => ({
        id: `friend-${index}`,
        name,
        status: Math.random() > 0.5 ? 'online' : 'offline' as 'online' | 'offline',
        lastSeen: Math.random() > 0.5 ? 'Now' : '2 hours ago'
      }));

      setFriends(friendsList);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    
    const newGroup: ChatGroup = {
      id: Date.now().toString(),
      name: groupName,
      members: [username || ''],
      lastMessage: 'Group created',
      timestamp: 'Now',
      unread: 0
    };
    
    setChatGroups([...chatGroups, newGroup]);
    setGroupName('');
    setShowCreateGroup(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (!username) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages & Chat</h1>
          <p className="text-gray-600">Please login to access chat features</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Login Required</h3>
            <p className="text-gray-500">You need to be logged in to access chat features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages & Chat</h1>
          <div className="flex items-center gap-4 mt-2">
            <Button variant="ghost" size="sm" className="text-blue-600">
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600">
              Sort by time ▼
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Chat Groups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Chat Groups
            </CardTitle>
            <Button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Group
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateGroup && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex gap-2">
                <Input
                  placeholder="Group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleCreateGroup}>Create</Button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {chatGroups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer border">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${group.isPublic ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                    <Users className={`w-6 h-6 ${group.isPublic ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      {group.name}
                      {group.isPublic && <Badge variant="secondary">Public</Badge>}
                    </h3>
                    <p className="text-sm text-gray-500">{group.lastMessage}</p>
                    <p className="text-xs text-gray-400">{group.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {group.unread > 0 && (
                    <Badge variant="destructive">{group.unread}</Badge>
                  )}
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Friends ({friends.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No friends yet. Accept friend requests to start chatting!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <UserAvatar username={friend.name} size="md" />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(friend.status)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{friend.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {friend.status} • {friend.lastSeen}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSection;
