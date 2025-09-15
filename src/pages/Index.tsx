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
import ModernAuthModal from '@/components/ModernAuthModal';
import ProjectsSection from '@/components/ProjectsSection';
import FloatingSideNavButton from '@/components/FloatingSideNavButton';
import { toast } from "sonner";
import FloatingAdminButton from '@/components/FloatingAdminButton';
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [username, setUsername] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPage, setPendingPage] = useState<string | null>(null);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [isStaff, setIsStaff] = useState<boolean>(false);

  // Load user data from localStorage on mount and update last_active
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
      // Update last_active for guest accounts
      updateLastActive(savedUsername);
    } else {
      // Show auth modal immediately for new users
      setShowAuthModal(true);
    }

    // Listen for mobile menu toggle event
    const handleMobileMenuToggle = () => {
      const event = new CustomEvent('open-side-navigation');
      window.dispatchEvent(event);
    };

    window.addEventListener('toggle-mobile-menu', handleMobileMenuToggle);

    return () => {
      window.removeEventListener('toggle-mobile-menu', handleMobileMenuToggle);
    };
  }, []);

  // Function to update last_active in Supabase for guest tracking
  const updateLastActive = async (username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          username, 
          last_active: new Date().toISOString() 
        }, { onConflict: 'username' });
      
      if (error) {
        console.log('Note: Could not update last_active for guest account');
      }
    } catch (error) {
      console.log('Note: Could not update last_active for guest account');
    }
  };

  const handleAuthSubmit = async (inputUsername: string, password?: string, isNewUser?: boolean, isGoogle?: boolean, securityData?: any) => {
    try {
      // Handle Google login (no password required)
      if (isGoogle && !password) {
        // Check if username already exists for Google users
        const existingUser = localStorage.getItem(`user_${inputUsername}`);
        if (existingUser) {
          toast.error("Username already exists. Please choose a different one.");
          return;
        }

        localStorage.setItem('username', inputUsername);
        setUsername(inputUsername);
        setShowAuthModal(false);
        
        // Update last_active for Google accounts
        await updateLastActive(inputUsername);
        
        toast.success("Signed in with Google successfully!");
        
        if (pendingPage) {
          setCurrentPage(pendingPage);
          setPendingPage(null);
        }
        return;
      }

      // All non-Google authentication now requires a password
      if (!password?.trim()) {
        toast.error("Password is required");
        return;
      }

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

        // Store user credentials with unique key including security data
        const userData = { 
          username: inputUsername, 
          password,
          securityQuestion: securityData?.question,
          securityAnswer: securityData?.answer
        };
        localStorage.setItem(`user_${inputUsername}`, JSON.stringify(userData));
        localStorage.setItem('username', inputUsername);
        
        setUsername(inputUsername);
        setShowAuthModal(false);
        
        // Update last_active for the new account
        await updateLastActive(inputUsername);
        
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
            
            // Update last_active for returning user
            await updateLastActive(inputUsername);
            
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
      case 'donations':
        return <ProjectsSection />;
      default:
        return <HomePage onNavigate={handleNavigate} username={username || undefined} currentPage={currentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      {/* Hide bottom navigation on chat pages */}
      {!['public-chat', 'private-chat', 'messages'].includes(currentPage) && (
        <BottomNavigation 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          isStaff={isStaff}
          username={username || undefined}
        />
      )}

      <ModernAuthModal 
        isOpen={showAuthModal} 
        onSubmit={handleAuthSubmit}
        onGoogleAuth={() => {
          // Google auth implementation would go here
          toast.info("Google authentication will be available soon!");
        }}
        onGuestExplore={() => {
          setShowAuthModal(false);
          toast.info("Exploring as guest - some features will be limited");
        }}
      />
      {username && <FloatingAdminButton username={username} />}
      <FloatingSideNavButton 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        username={username || undefined}
      />
    </div>
  );
};

export default Index;
