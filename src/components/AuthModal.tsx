
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onSubmit: (username: string, password: string, isNewUser: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }
    onSubmit(username.trim(), password.trim(), isNewUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isNewUser ? 'Create Account' : 'Login'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-sm"
            >
              {isNewUser ? 'Already have an account?' : 'Need to create an account?'}
            </Button>
          </div>
          <Button type="submit" className="w-full">
            {isNewUser ? 'Create Account' : 'Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
