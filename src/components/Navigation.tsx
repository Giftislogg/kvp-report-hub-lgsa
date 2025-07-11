
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, X, Megaphone } from "lucide-react";
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
    { id: 'announcements', label: 'News', icon: Megaphone },
    { id: 'report', label: 'Report' },
    { id: 'public-chat', label: 'Public Chat' },
    { id: 'private-chat', label: '1-on-1 Chat' },
    { id: 'messages', label: 'My Messages' },
  ];

  const handleAdminLogin = () => {
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
      {/* Mobile Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white shadow-lg sticky top-0 z-50">
        <div className="px-3 sm:px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left side - Menu button (only on home page) */}
            <div className="flex items-center gap-3">
              {currentPage === 'home' && onToggleSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSidebar}
                  className="text-white hover:bg-white/10 p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              
              <h1 
                className="text-base sm:text-lg font-bold cursor-pointer hover:text-blue-200 transition-colors truncate" 
                onClick={() => onNavigate('home')}
              >
                KVRP Support Center
              </h1>
            </div>
            
            {/* Right side - User info and mobile menu */}
            <div className="flex items-center gap-2">
              {guestName && (
                <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full gap-2">
                  <UserAvatar username={guestName} size="sm" />
                  <span className="text-sm hidden md:block">Welcome, {guestName}</span>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="pb-3 space-y-1 border-t border-white/20 mt-2 pt-3">
              {guestName && (
                <div className="sm:hidden bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg mb-2 flex items-center gap-2">
                  <UserAvatar username={guestName} size="sm" />
                  <span className="text-sm">Welcome, {guestName}</span>
                </div>
              )}
              
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "secondary" : "ghost"}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start text-white hover:bg-white/20 hover:text-white gap-2 h-10"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Admin Panel Button - Fixed at bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowAdminLogin(true)}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full px-3 py-2 text-sm"
        >
          Admin
        </Button>
      </div>

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
            <Button onClick={handleAdminLogin} className="w-full">
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navigation;
