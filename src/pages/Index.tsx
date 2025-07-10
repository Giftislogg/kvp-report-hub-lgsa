
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [username, setUsername] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPage, setPendingPage] = useState<string | null>(null);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      fetchNotificationCount(savedUsername);
    }
  }, []);

  // Subscribe to notifications when user is logged in
  useEffect(() => {
    if (!username) return;

    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public', 
        table: 'notifications',
        filter: `to_user=eq.${username}`
      }, () => {
        fetchNotificationCount(username);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const fetchNotificationCount = async (user: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('to_user', user)
        .eq('read', false);

      if (!error) {
        setNotificationCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleAuthSubmit = async (inputUsername: string, password: string, isNewUser: boolean) => {
    try {
      if (isNewUser) {
        // Store user credentials
        const userData = { username: inputUsername, password };
        localStorage.setItem('userCredentials', JSON.stringify(userData));
        localStorage.setItem('username', inputUsername);
        
        setUsername(inputUsername);
        setShowAuthModal(false);
        toast.success("Account created successfully!");
      } else {
        // Verify existing user
        const storedData = localStorage.getItem('userCredentials');
        if (storedData) {
          const { username: storedUsername, password: storedPassword } = JSON.parse(storedData);
          if (storedUsername === inputUsername && storedPassword === password) {
            localStorage.setItem('username', inputUsername);
            setUsername(inputUsername);
            setShowAuthModal(false);
            toast.success("Logged in successfully!");
          } else {
            toast.error("Invalid credentials");
            return;
          }
        } else {
          toast.error("No account found. Please create an account first.");
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
    localStorage.removeItem('userCredentials');
    setUsername(null);
    setCurrentPage('home');
    toast.success("Logged out successfully");
  };

  const renderCurrentPage = () => {
    if (!username && ['report', 'public-chat', 'private-chat', 'messages', 'notifications', 'settings'].includes(currentPage)) {
      return <HomePage onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
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
        return <HomePage onNavigate={handleNavigate} />;
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
        notificationCount={notificationCount}
      />

      <AuthModal 
        isOpen={showAuthModal} 
        onSubmit={handleAuthSubmit} 
      />
    </div>
  );
};

export default Index;
