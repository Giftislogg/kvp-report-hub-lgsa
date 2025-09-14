import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Chrome, User, X, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ModernAuthModalProps {
  isOpen: boolean;
  onSubmit: (username: string, password?: string, isNewUser?: boolean, isGoogle?: boolean, securityData?: any) => void;
  onGoogleAuth?: () => void;
  onGuestExplore?: () => void;
}

const securityQuestions = [
  "What is your mother's first name?",
  "What is your pet's name?",
  "What city were you born in?",
  "What is your favorite color?",
  "What was your first car model?",
  "What is your favorite movie?",
  "What elementary school did you attend?"
];

const ModernAuthModal: React.FC<ModernAuthModalProps> = ({ 
  isOpen, 
  onSubmit, 
  onGoogleAuth,
  onGuestExplore 
}) => {
  const [authType, setAuthType] = useState<'choose' | 'guest' | 'account' | 'security' | 'forgot-password' | 'recovery'>('choose');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showExploreOption, setShowExploreOption] = useState(false);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password");
      return;
    }
    
    // Check if user exists in localStorage with case-insensitive search
    const allKeys = Object.keys(localStorage);
    const existingUser = allKeys.find(key => {
      if (key.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          return userData.username?.toLowerCase() === username.trim().toLowerCase();
        } catch {
          return false;
        }
      }
      return false;
    });

    if (isNewUser) {
      if (existingUser) {
        toast.error("Username already exists. Please choose a different one or try logging in.");
        return;
      }
      // For new users, proceed to security questions
      setAuthType('security');
    } else {
      if (!existingUser) {
        toast.error("No account found with this username. Please create an account first.");
        return;
      }
      
      // Verify password for existing user
      const userData = JSON.parse(localStorage.getItem(existingUser) || '{}');
      if (userData.password !== password.trim()) {
        toast.error("Invalid password. Forgot your password?");
        setShowExploreOption(true);
        return;
      }
      
      onSubmit(username.trim(), password.trim(), false);
    }
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityQuestion || !securityAnswer.trim()) {
      toast.error("Please select a security question and provide an answer");
      return;
    }
    
    if (confirmPassword !== password) {
      toast.error("Passwords do not match");
      return;
    }

    const securityData = {
      question: securityQuestion,
      answer: securityAnswer.trim().toLowerCase()
    };
    
    onSubmit(username.trim(), password.trim(), true, false, securityData);
  };

  const handleForgotPassword = () => {
    if (!username.trim()) {
      toast.error("Please enter your username first");
      return;
    }
    
    // Check if user exists
    const allKeys = Object.keys(localStorage);
    const existingUser = allKeys.find(key => {
      if (key.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          return userData.username?.toLowerCase() === username.trim().toLowerCase();
        } catch {
          return false;
        }
      }
      return false;
    });

    if (!existingUser) {
      toast.error("No account found with this username");
      return;
    }

    const userData = JSON.parse(localStorage.getItem(existingUser) || '{}');
    if (!userData.securityQuestion) {
      toast.error("This account doesn't have security questions set up. Please contact admin for help.");
      return;
    }

    setAuthType('recovery');
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
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast.error("Google authentication failed");
        console.error('Google auth error:', error);
        return;
      }
      
      // After successful Google auth, show success
      toast.success("Google authentication successful!");
    } catch (error) {
      toast.error("Google authentication not available");
      console.error('Google auth error:', error);
    }
  };

  const resetModal = () => {
    setAuthType('choose');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setIsNewUser(true);
    setShowExploreOption(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-between">
            Welcome to KVRP
            {onGuestExplore && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onGuestExplore}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Explore
              </Button>
            )}
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
                <p className="text-sm text-gray-600">Create a guest account with password</p>
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
              <h3 className="font-semibold text-lg">
                {isNewUser ? 'Create Guest Account' : 'Login to Guest Account'}
              </h3>
              <p className="text-sm text-gray-600">
                {isNewUser ? 'Create your guest account with a password' : 'Login with your guest account'}
              </p>
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
            <div>
              <Label htmlFor="guestPassword">Password</Label>
              <Input
                id="guestPassword"
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
              {!isNewUser && showExploreOption && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600"
                >
                  Forgot Password?
                </Button>
              )}
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


        {authType === 'security' && (
          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">Security Questions</h3>
              <p className="text-sm text-gray-600">Set up 2-step verification for your account</p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            <div>
              <Label htmlFor="securityQuestion">Security Question</Label>
              <Select value={securityQuestion} onValueChange={setSecurityQuestion} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a security question" />
                </SelectTrigger>
                <SelectContent>
                  {securityQuestions.map((question, index) => (
                    <SelectItem key={index} value={question}>
                      {question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="securityAnswer">Answer</Label>
              <Input
                id="securityAnswer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Enter your answer"
                required
              />
              <p className="text-xs text-gray-500 mt-1">This will be used for account recovery</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setAuthType('guest')} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Create Account
              </Button>
            </div>
          </form>
        )}

        {authType === 'recovery' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-lg">Account Recovery</h3>
              <p className="text-sm text-gray-600">Answer your security question to reset your password</p>
            </div>
            
            {(() => {
              const userKey = Object.keys(localStorage).find(key => {
                if (key.startsWith('user_')) {
                  try {
                    const userData = JSON.parse(localStorage.getItem(key) || '{}');
                    return userData.username?.toLowerCase() === username.trim().toLowerCase();
                  } catch {
                    return false;
                  }
                }
                return false;
              });
              
              if (userKey) {
                const userData = JSON.parse(localStorage.getItem(userKey) || '{}');
                return (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const answer = formData.get('answer') as string;
                    const newPassword = formData.get('newPassword') as string;
                    
                    if (answer.trim().toLowerCase() === userData.securityAnswer) {
                      // Update password
                      const updatedData = { ...userData, password: newPassword };
                      localStorage.setItem(userKey, JSON.stringify(updatedData));
                      toast.success("Password updated successfully!");
                      resetModal();
                      onSubmit(username.trim(), newPassword, false);
                    } else {
                      toast.error("Incorrect answer. Please try again.");
                    }
                  }} className="space-y-4">
                    <div>
                      <Label className="font-medium text-gray-700">Security Question:</Label>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {userData.securityQuestion}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="answer">Your Answer</Label>
                      <Input
                        name="answer"
                        placeholder="Enter your answer"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={resetModal} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Reset Password
                      </Button>
                    </div>
                  </form>
                );
              }
              return null;
            })()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModernAuthModal;