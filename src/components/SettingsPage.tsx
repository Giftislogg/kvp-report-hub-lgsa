
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Moon, Sun, Trash2, Shield, ExternalLink } from "lucide-react";

interface SettingsPageProps {
  username: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ username, onNavigate, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode enabled`);
  };

  const clearCache = async () => {
    try {
      // Clear admin messages for this user
      await supabase
        .from('admin_messages')
        .delete()
        .eq('guest_name', username);
      
      // Clear private chat messages where user is involved
      await supabase
        .from('private_chats')
        .delete()
        .or(`sender_name.eq.${username},receiver_name.eq.${username}`);
      
      toast.success("Chat history cleared successfully");
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error("Failed to clear chat history");
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'LimitlessLGASGL') {
      toast.success("Admin access granted");
      onNavigate('admin');
      setAdminPassword('');
      setShowAdminLogin(false);
    } else {
      toast.error("Invalid admin password");
    }
  };

  const visitOfficialWebsite = () => {
    window.open('https://lgsa-tm.com', '_blank');
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {username}
                  </Badge>
                </div>
              </div>
              <Button onClick={onLogout} variant="outline" className="w-full">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <Label>Dark Mode</Label>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Clear all your chat history and messages from admins and other players.
              </p>
              <Button 
                onClick={clearCache} 
                variant="destructive" 
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!showAdminLogin ? (
                <Button 
                  onClick={() => setShowAdminLogin(true)}
                  variant="outline"
                  className="w-full"
                >
                  Access Admin Panel
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAdminLogin} className="flex-1">
                      Login
                    </Button>
                    <Button 
                      onClick={() => setShowAdminLogin(false)} 
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Community */}
        <Card>
          <CardHeader>
            <CardTitle>Join the Community</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={visitOfficialWebsite}
              className="w-full"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit LGSA-TM.com
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
