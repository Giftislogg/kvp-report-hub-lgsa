
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Megaphone, BookOpen, ChevronRight, UserPlus, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from './UserAvatar';

interface SideNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  username?: string;
  onClose?: () => void;
}

interface RegisteredUser {
  id: string;
  author_name: string;
  timestamp: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  activeSection, 
  onSectionChange,
  username,
  onClose 
}) => {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
  ];

  useEffect(() => {
    fetchRegisteredUsers();
  }, []);

  const fetchRegisteredUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('author_name, timestamp')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Get unique users from posts
      const uniqueUsers = data?.reduce((acc: RegisteredUser[], post) => {
        if (!acc.find(user => user.author_name === post.author_name) && post.author_name !== username) {
          acc.push({
            id: `user-${post.author_name}`,
            author_name: post.author_name,
            timestamp: post.timestamp
          });
        }
        return acc;
      }, []) || [];

      setRegisteredUsers(uniqueUsers.slice(0, 6)); // Show max 6 users
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    if (onClose) onClose();
  };

  const handleAddFriend = async (friendName: string) => {
    if (!username) {
      toast.error('Please login to add friends');
      return;
    }

    try {
      // Insert friend request notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          from_user: username,
          to_user: friendName,
          type: 'friend_request',
          message: `${username} sent you a friend request`,
          read: false
        });

      if (error) {
        console.error('Error sending friend request:', error);
        toast.error('Failed to send friend request');
        return;
      }

      toast.success(`Friend request sent to ${friendName}`);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to send friend request');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-4 space-y-4">
      {/* Main Navigation */}
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => handleSectionChange(item.id)}
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
      </div>

      {/* Suggested Friends Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Suggested Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-sm text-gray-500">Loading users...</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {registeredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <UserAvatar username={user.author_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{user.author_name}</p>
                      <p className="text-xs text-gray-500">Platform Member</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs px-2 py-1"
                    onClick={() => handleAddFriend(user.author_name)}
                    disabled={!username}
                  >
                    Add Friend
                  </Button>
                </div>
              ))}
              {registeredUsers.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No registered users found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SideNavigation;
