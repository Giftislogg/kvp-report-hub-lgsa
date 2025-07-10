
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/HomePage';
import ReportForm from '@/components/ReportForm';
import PublicChat from '@/components/PublicChat';
import PrivateChat from '@/components/PrivateChat';
import AdminMessages from '@/components/AdminMessages';
import AdminPanel from '@/components/AdminPanel';
import GuestNameModal from '@/components/GuestNameModal';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [guestName, setGuestName] = useState<string | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [pendingPage, setPendingPage] = useState<string | null>(null);

  // Load guest name from localStorage on mount
  useEffect(() => {
    const savedGuestName = localStorage.getItem('guestName');
    if (savedGuestName) {
      setGuestName(savedGuestName);
    }
  }, []);

  const handleGuestNameSubmit = (name: string) => {
    setGuestName(name);
    localStorage.setItem('guestName', name);
    setShowGuestModal(false);
    
    if (pendingPage) {
      setCurrentPage(pendingPage);
      setPendingPage(null);
    }
  };

  const handleNavigate = (page: string) => {
    // Pages that require guest name
    const requiresGuestName = ['report', 'public-chat', 'private-chat', 'messages'];
    
    if (requiresGuestName.includes(page) && !guestName) {
      setPendingPage(page);
      setShowGuestModal(true);
      return;
    }
    
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    if (!guestName && ['report', 'public-chat', 'private-chat', 'messages'].includes(currentPage)) {
      return <HomePage onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'report':
        return <ReportForm guestName={guestName!} />;
      case 'public-chat':
        return <PublicChat guestName={guestName!} />;
      case 'private-chat':
        return <PrivateChat guestName={guestName!} />;
      case 'messages':
        return <AdminMessages guestName={guestName!} />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        guestName={guestName} 
      />
      
      <main>
        {renderCurrentPage()}
      </main>

      <GuestNameModal 
        isOpen={showGuestModal} 
        onSubmit={handleGuestNameSubmit} 
      />
    </div>
  );
};

export default Index;
