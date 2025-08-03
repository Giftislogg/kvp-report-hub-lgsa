
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Moon, Sun, Trash2, Shield, ExternalLink, Camera, Palette } from "lucide-react";

interface SettingsPageProps {
  username: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ username, onNavigate, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [theme, setTheme] = useState<'blue' | 'purple' | 'green'>('blue');

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Load profile picture and theme
    const savedPicture = localStorage.getItem(`profilePicture_${username}`);
    const savedTheme = localStorage.getItem(`theme_${username}`) as 'blue' | 'purple' | 'green';
    if (savedPicture) setProfilePicture(savedPicture);
    if (savedTheme) setTheme(savedTheme);
  }, [username]);

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
    if (adminPassword === 'kvrplobby') {
      toast.success("Admin access granted");
      onNavigate('admin');
      setAdminPassword('');
      setShowAdminLogin(false);
    } else {
      toast.error("Invalid password");
    }
  };

  const visitOfficialWebsite = () => {
    window.open('https://lgsa-tm.com', '_blank');
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePicture(result);
        localStorage.setItem(`profilePicture_${username}`, result);
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem(`profilePicture_${username}`);
    toast.success("Profile picture removed!");
  };

  const changeTheme = (newTheme: 'blue' | 'purple' | 'green') => {
    setTheme(newTheme);
    localStorage.setItem(`theme_${username}`, newTheme);
    
    // Apply theme colors to root
    const root = document.documentElement;
    switch (newTheme) {
      case 'blue':
        root.style.setProperty('--primary', '217 91% 60%');
        root.style.setProperty('--primary-foreground', '0 0% 98%');
        break;
      case 'purple':
        root.style.setProperty('--primary', '262 83% 58%');
        root.style.setProperty('--primary-foreground', '0 0% 98%');
        break;
      case 'green':
        root.style.setProperty('--primary', '142 76% 36%');
        root.style.setProperty('--primary-foreground', '0 0% 98%');
        break;
    }
    
    toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme applied!`);
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
              {/* Profile Picture */}
              <div>
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Camera className="w-4 h-4 mr-2" />
                          Change Picture
                        </span>
                      </Button>
                    </label>
                    {profilePicture && (
                      <Button variant="outline" size="sm" onClick={removeProfilePicture}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

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
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <Label>Dark Mode</Label>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>

              {/* Theme Colors */}
              <div>
                <Label className="text-sm font-medium">App Theme</Label>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => changeTheme('blue')}
                    className={`w-8 h-8 rounded-full bg-blue-500 border-2 ${
                      theme === 'blue' ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                    }`}
                    title="Blue theme"
                  />
                  <button
                    onClick={() => changeTheme('purple')}
                    className={`w-8 h-8 rounded-full bg-purple-500 border-2 ${
                      theme === 'purple' ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                    }`}
                    title="Purple theme"
                  />
                  <button
                    onClick={() => changeTheme('green')}
                    className={`w-8 h-8 rounded-full bg-green-500 border-2 ${
                      theme === 'green' ? 'border-gray-900 dark:border-white' : 'border-gray-300'
                    }`}
                    title="Green theme"
                  />
                </div>
              </div>
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
