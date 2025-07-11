
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Plus, MoreHorizontal, Search } from "lucide-react";
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

  // Mock data - replace with actual data from Supabase
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'Alex Johnson', status: 'online', lastSeen: 'Now' },
    { id: '2', name: 'Sarah Wilson', status: 'offline', lastSeen: '2 hours ago' },
    { id: '3', name: 'Mike Davis', status: 'online', lastSeen: 'Now' },
  ]);

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
    
    setChatGroups([newGroup, ...chatGroups]);
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

      {/* Create Group Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Create a group
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
          <p className="text-sm text-gray-600">Be the first to create a group</p>
        </CardHeader>
        {showCreateGroup && (
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreateGroup}>Create</Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chat Groups */}
      {chatGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chatGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.lastMessage}</p>
                      <p className="text-xs text-gray-400">{group.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.unread > 0 && (
                      <Badge variant="secondary">{group.unread}</Badge>
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
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your friends</CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No friends yet. Send friend requests to start chatting!
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
