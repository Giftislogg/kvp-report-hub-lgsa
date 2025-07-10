
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Users, Bell } from "lucide-react";

interface NotificationsPageProps {
  username: string;
  onNavigate: (page: string, data?: any) => void;
}

interface Notification {
  id: string;
  type: 'admin_message' | 'chat_request' | 'chat_accepted';
  from_user: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ username, onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeChats, setActiveChats] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
    fetchActiveChats();
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `to_user=eq.${username}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('to_user', username)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const fetchActiveChats = async () => {
    try {
      const { data, error } = await supabase
        .from('active_chats')
        .select('*')
        .or(`user1.eq.${username},user2.eq.${username}`);

      if (error) {
        console.error('Error fetching active chats:', error);
        return;
      }

      const chatUsers = data?.map(chat => 
        chat.user1 === username ? chat.user2 : chat.user1
      ) || [];
      
      setActiveChats(chatUsers);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleChatRequest = async (fromUser: string, accept: boolean) => {
    try {
      if (accept) {
        await supabase
          .from('active_chats')
          .insert({
            user1: fromUser,
            user2: username,
            status: 'active'
          });
        
        toast.success(`Chat accepted with ${fromUser}`);
        onNavigate('private-chat', { targetPlayer: fromUser });
      } else {
        toast.success("Chat request declined");
      }
      
      // Remove notification
      await supabase
        .from('notifications')
        .delete()
        .eq('from_user', fromUser)
        .eq('to_user', username)
        .eq('type', 'chat_request');
        
      fetchNotifications();
      fetchActiveChats();
    } catch (error) {
      console.error('Error handling chat request:', error);
      toast.error("Failed to handle chat request");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="space-y-6">
        {/* Active Chats */}
        {activeChats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Chats ({activeChats.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeChats.map((chatUser) => (
                  <Button
                    key={chatUser}
                    variant="outline"
                    onClick={() => onNavigate('private-chat', { targetPlayer: chatUser })}
                    className="w-full justify-start"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with {chatUser}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications ({notifications.filter(n => !n.read).length} unread)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No notifications yet
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={notification.type === 'admin_message' ? 'destructive' : 'default'}>
                            {notification.type === 'admin_message' ? 'Admin' :
                             notification.type === 'chat_request' ? 'Chat Request' : 'Chat Accepted'}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold">From: {notification.from_user}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {notification.type === 'chat_request' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleChatRequest(notification.from_user, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChatRequest(notification.from_user, false)}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      
                      {notification.type === 'admin_message' && (
                        <Button
                          size="sm"
                          onClick={() => onNavigate('messages')}
                        >
                          View Messages
                        </Button>
                      )}
                      
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
