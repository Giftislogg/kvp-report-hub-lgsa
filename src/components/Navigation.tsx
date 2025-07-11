
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, X, Sidebar } from "lucide-react";
import UserAvatar from './UserAvatar';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  guestName: string | null;
  onToggleSidebar?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onNavigate, 
  guestName,
  onToggleSidebar 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'Report Form' },
    { id: 'public-chat', label: 'Public Chat' },
    { id: 'private-chat', label: '1-on-1 Chat' },
    { id: 'messages', label: 'My Messages' },
  ];

  const handleAdminLogin = () => {
    // Simple password check - in production, use proper authentication
    if (adminPassword === 'admin123') {
      setShowAdminLogin(false);
      setAdminPassword('');
      setAdminError('');
      onNavigate('admin');
    } else {
      setAdminError('Invalid password');
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              {/* Sidebar toggle button */}
              {currentPage === 'home' && onToggleSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSidebar}
                  className="text-white hover:bg-white/10"
                >
                  <Sidebar className="w-5 h-5" />
                </Button>
              )}
              
              <h1 
                className="text-xl md:text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors" 
                onClick={() => onNavigate('home')}
              >
                KASI Vibes Role-Play Support Center
              </h1>
            </div>
            
            {guestName && (
              <div className="hidden md:flex items-center bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full gap-2">
                <UserAvatar username={guestName} size="sm" />
                <span className="text-sm">Welcome, {guestName}</span>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-wrap gap-2 pb-4">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                onClick={() => onNavigate(item.id)}
                className="text-white hover:bg-white/20 hover:text-white"
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {guestName && (
                <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg mb-3 flex items-center gap-2">
                  <UserAvatar username={guestName} size="sm" />
                  <span className="text-sm">Welcome, {guestName}</span>
                </div>
              )}
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-start text-white hover:bg-white/20 hover:text-white"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Admin Panel Button - Fixed at bottom */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowAdminLogin(true)}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full px-6 py-3"
          >
            Admin Panel
          </Button>
        </div>
      </nav>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            {adminError && (
              <p className="text-red-500 text-sm">{adminError}</p>
            )}
            <Button onClick={handleA

inLogin} className="w-full">
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navigation;
