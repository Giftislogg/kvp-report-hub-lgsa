import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Chrome, User } from "lucide-react";

interface ModernAuthModalProps {
  isOpen: boolean;
  onSubmit: (username: string, password?: string, isNewUser?: boolean, isGoogle?: boolean) => void;
  onGoogleAuth?: () => void;
}

const ModernAuthModal: React.FC<ModernAuthModalProps> = ({ 
  isOpen, 
  onSubmit, 
  onGoogleAuth 
}) => {
  const [authType, setAuthType] = useState<'choose' | 'guest' | 'google' | 'username' | 'account'>('choose');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter your roleplay name");
      return;
    }
    onSubmit(username.trim());
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }
    onSubmit(username.trim(), password.trim(), isNewUser);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please tell us what to call you");
      return;
    }
    onSubmit(username.trim(), undefined, undefined, true);
  };

  const handleGoogleAuth = async () => {
    if (onGoogleAuth) {
      onGoogleAuth();
      setAuthType('username');
    } else {
      toast.error("Google authentication not available");
    }
  };

  const resetModal = () => {
    setAuthType('choose');
    setUsername('');
    setPassword('');
    setIsNewUser(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to KVRP
          </DialogTitle>
        </DialogHeader>

        {authType === 'choose' && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              Choose how you'd like to join our community
            </p>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setAuthType('guest')}>
              <CardContent className="p-4 text-center">
                <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">Continue as Guest</h3>
                <p className="text-sm text-gray-600">Join with just your roleplay name</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleGoogleAuth}>
              <CardContent className="p-4 text-center">
                <Chrome className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <h3 className="font-semibold mb-1">Sign in with Google</h3>
                <p className="text-sm text-gray-600">Quick and secure authentication</p>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setAuthType('account')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Or create an account with username & password
              </Button>
            </div>
          </div>
        )}

        {authType === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">Enter Your Roleplay Name</h3>
              <p className="text-sm text-gray-600">This is how others will see you in the community</p>
            </div>
            <div>
              <Label htmlFor="guestName">Roleplay Name</Label>
              <Input
                id="guestName"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your roleplay name"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetModal} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Continue
              </Button>
            </div>
          </form>
        )}

        {authType === 'username' && (
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">What should we call you?</h3>
              <p className="text-sm text-gray-600">Choose your roleplay name for the community</p>
            </div>
            <div>
              <Label htmlFor="displayName">Your Roleplay Name</Label>
              <Input
                id="displayName"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your roleplay name"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Complete Setup
            </Button>
          </form>
        )}

        {authType === 'account' && (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">
                {isNewUser ? 'Create Account' : 'Login'}
              </h3>
            </div>
            <div>
              <Label htmlFor="username">Roleplay Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your roleplay name"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isNewUser ? "Create a password" : "Enter your password"}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsNewUser(!isNewUser)}
                className="text-sm"
              >
                {isNewUser ? 'Already have an account?' : 'Need to create an account?'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetModal} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                {isNewUser ? 'Create Account' : 'Login'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModernAuthModal;