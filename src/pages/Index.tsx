import React, { useState, useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import HomePage from '@/components/HomePage';
import ReportForm from '@/components/ReportForm';
import PublicChat from '@/components/PublicChat';
import PrivateChat from '@/components/PrivateChat';
import AdminMessages from '@/components/AdminMessages';
import AdminPanel from '@/components/AdminPanel';
import NotificationsPage from '@/components/NotificationsPage';
import SettingsPage from '@/components/SettingsPage';
import AuthModal from '@/components/AuthModal';
import FloatingHelpBot from '@/components/FloatingHelpBot';
import { toast } from "sonner";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [username, setUsername] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPage, setPendingPage] = useState<string | null>(null);
  const [navigationData, setNavigationData] = useState<any>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleAuthSubmit = async (inputUsername: string, password: string, isNewUser: boolean) => {
    try {
      if (isNewUser) {
        // Check if username already exists
        const existingUser = localStorage.getItem(`user_${inputUsername}`);
        if (existingUser) {
          toast.error("Username already exists. Please choose a different one or login instead.");
          return;
        }

        // Also check if any other users have the same username (case-insensitive)
        const allKeys = Object.keys(localStorage);
        const existingUsernames = allKeys
          .filter(key => key.startsWith('user_'))
          .map(key => {
            try {
              const userData = JSON.parse(localStorage.getItem(key) || '{}');
              return userData.username?.toLowerCase();
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        if (existingUsernames.includes(inputUsername.toLowerCase())) {
          toast.error("Username already exists. Please choose a different one or login instead.");
          return;
        }

        // Store user credentials with unique key
        const userData = { username: inputUsername, password };
        localStorage.setItem(`user_${inputUsername}`, JSON.stringify(userData));
        localStorage.setItem('username', inputUsername);
        
        setUsername(inputUsername);
        setShowAuthModal(false);
        toast.success("Account created successfully!");
      } else {
        // Verify existing user
        const storedData = localStorage.getItem(`user_${inputUsername}`);
        if (storedData) {
          const { password: storedPassword } = JSON.parse(storedData);
          if (storedPassword === password) {
            localStorage.setItem('username', inputUsername);
            setUsername(inputUsername);
            setShowAuthModal(false);
            toast.success("Logged in successfully!");
          } else {
            toast.error("Invalid password");
            return;
          }
        } else {
          toast.error("No account found with this username. Please create an account first.");
          return;
        }
      }
      
      if (pendingPage) {
        setCurrentPage(pendingPage);
        setPendingPage(null);
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error("Authentication failed");
    }
  };

  const handleNavigate = (page: string, data?: any) => {
    // Pages that require authentication
    const requiresAuth = ['report', 'public-chat', 'private-chat', 'messages', 'notifications'];
    
    if (requiresAuth.includes(page) && !username) {
      setPendingPage(page);
      setNavigationData(data);
      setShowAuthModal(true);
      return;
    }
    
    setCurrentPage(page);
    setNavigationData(data);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUsername(null);
    setCurrentPage('home');
    toast.success("Logged out successfully");
  };

  const renderCurrentPage = () => {
    if (!username && ['report', 'public-chat', 'private-chat', 'messages', 'notifications', 'settings'].includes(currentPage)) {
      return <HomePage onNavigate={handleNavigate} currentPage={currentPage} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} username={username || undefined} currentPage={currentPage} />;
      case 'report':
        return <ReportForm guestName={username!} />;
      case 'public-chat':
        return <PublicChat guestName={username!} />;
      case 'private-chat':
        return <PrivateChat guestName={username!} initialTarget={navigationData?.targetPlayer} />;
      case 'messages':
        return <AdminMessages guestName={username!} />;
      case 'notifications':
        return <NotificationsPage username={username!} onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage username={username!} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomePage onNavigate={handleNavigate} username={username || undefined} currentPage={currentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      <BottomNavigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
      />

      <AuthModal 
        isOpen={showAuthModal} 
        onSubmit={handleAuthSubmit} 
      />

      {currentPage === 'home' && <FloatingHelpBot />}
    </div>
  );
};

export default Index;
