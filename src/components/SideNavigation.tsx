
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Megaphone, BookOpen, ChevronRight, Users, UserPlus, MessageSquare, Shield } from "lucide-react";
import UserAvatar from './UserAvatar';

interface SideNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  username?: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  activeSection, 
  onSectionChange,
  username 
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
  ];

  // Mock friend suggestions data - registered users
  const friendSuggestions = [
    { id: 1, name: 'Alex Johnson', mutual: 3, status: 'online' },
    { id: 2, name: 'Sarah Wilson', mutual: 7, status: 'offline' },
    { id: 3, name: 'Mike Davis', mutual: 2, status: 'online' },
    { id: 4, name: 'Emma Brown', mutual: 5, status: 'away' },
  ];

  // Mock admin messages
  const adminMessages = [
    { id: 1, message: 'Welcome to KVRP! Please read the rules.', timestamp: '2 hours ago', read: false },
    { id: 2, message: 'Server maintenance scheduled for tonight.', timestamp: '1 day ago', read: true },
    { id: 3, message: 'New features have been added to the platform.', timestamp: '3 days ago', read: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 shadow-sm h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
        
        {/* Main Navigation */}
        <nav className="space-y-2 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onSectionChange(item.id)}
                className={`w-full justify-start gap-3 ${
                  isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Button>
            );
          })}
        </nav>

        {/* Friend Suggestions Section */}
        {username && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Friend Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {friendSuggestions.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <UserAvatar username={friend.name} size="sm" />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(friend.status)} rounded-full border-2 border-white`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{friend.name}</p>
                        <p className="text-xs text-gray-500">{friend.mutual} mutual friends</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Messages Section */}
        {username && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {adminMessages.map((msg) => (
                  <div key={msg.id} className={`p-2 rounded-lg hover:bg-gray-50 border-l-2 ${
                    msg.read ? 'border-gray-300' : 'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{msg.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                        {!msg.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {username && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Online Players:</span>
                  <span className="font-medium text-green-600">247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Members:</span>
                  <span className="font-medium">1,543</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Friends:</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  );
};

export default SideNavigation;
