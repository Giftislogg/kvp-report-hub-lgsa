
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, MessageCircle, Search, MoreVertical } from "lucide-react";
import UserAvatar from './UserAvatar';

interface FriendsSectionProps {
  username?: string;
}

const FriendsSection: React.FC<FriendsSectionProps> = ({ username }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock friends data
  const friends = [
    { id: 1, name: 'Alex Johnson', status: 'online', lastSeen: 'Now' },
    { id: 2, name: 'Sarah Wilson', status: 'offline', lastSeen: '2 hours ago' },
    { id: 3, name: 'Mike Davis', status: 'online', lastSeen: 'Now' },
    { id: 4, name: 'Emma Brown', status: 'away', lastSeen: '5 minutes ago' },
    { id: 5, name: 'James Taylor', status: 'offline', lastSeen: '1 day ago' },
  ];

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">Please login to view and manage your friends</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Login Required</h3>
            <p className="text-gray-500">You need to be logged in to access the friends feature.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Friends</h1>
        <p className="text-gray-600">Connect and chat with your KVRP friends</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Friends ({filteredFriends.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No friends found matching your search.' : 'No friends yet. Start connecting with other players!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
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
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Friends Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter username or email..." className="flex-1" />
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Send Request
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Send friend requests to other KVRP players to connect and chat with them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendsSection;
