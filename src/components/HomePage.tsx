
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import SideNavigation from './SideNavigation';
import AnnouncementsSection from './AnnouncementsSection';
import TutorialsSection from './TutorialsSection';
import GamesSection from './GamesSection';
import CommunitySection from './CommunitySection';
import FloatingChatButton from './FloatingChatButton';
import PostsPage from './PostsPage';

interface HomePageProps {
  onNavigate: (page: string) => void;
  username?: string;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
  currentPage: string;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onNavigate, 
  username, 
  sidebarOpen = false,
  onCloseSidebar,
  currentPage 
}) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPublicChat, setShowPublicChat] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsDrawerOpen(false);
  };

  const handleShowPublicChat = () => {
    setShowPublicChat(true);
  };

  const handleBackToChat = () => {
    setShowPublicChat(false);
  };

  const renderContent = () => {
    // Handle different pages from bottom navigation
    switch (currentPage) {
      case 'posts':
        return <PostsPage username={username} />;
      case 'notifications':
        return <CommunitySection username={username} />;
      default:
        // Handle side navigation sections
        switch (activeSection) {
          case 'announcements':
            return <AnnouncementsSection username={username} />;
          case 'tutorials':
            return <TutorialsSection />;
          case 'games':
            return <GamesSection />;
          default:
            return (
              <>
                {/* Hero Section */}
                <div className="text-center mb-4">
                  <div className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-6 rounded-xl mb-4 shadow-2xl">
                    <div className="animate-pulse mb-2">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-2xl font-bold">KV</span>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      KVRP - KASI Vibes Role-Play
                    </h1>
                    <p className="text-sm text-gray-300 mb-3 font-medium">
                      🎮 Welcome to the ultimate South African GTA roleplay experience 🎮
                    </p>
                    <p className="text-gray-400 max-w-2xl mx-auto text-xs leading-relaxed">
                      With GTAM ONLINE, KVRP brings the heart of the GTA MZANSI experience to a living online world with multiple players. 
                      Just what you choose to do in that world, it's up to you...
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>

                {/* Live Stats Section */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">127</div>
                      <div className="text-xs text-green-700">Players Online</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-3 text-center">
                      <div className="text-sm font-bold text-blue-600">play.lgsa-tm.com:3314</div>
                      <div className="text-xs text-blue-700">Server IP</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Screenshot */}
                <div className="mb-4">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src="/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png" 
                      alt="KVRP Screenshot" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Community Section */}
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-center text-base">Join Our Community</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-gray-600 mb-3 text-sm">
                      Connect with fellow players, share your experiences, and stay updated with the latest news from KVRP.
                    </p>
                    <Button 
                      onClick={() => window.open('https://lgsa-tm.com', '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-sm"
                      size="sm"
                    >
                      Visit LGSA-TM.com
                    </Button>
                  </CardContent>
                </Card>

                {!username && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <h3 className="text-base font-semibold mb-2">Join the Community</h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        Login or create an account to access all features and connect with other players.
                      </p>
                      <Button onClick={() => onNavigate('public-chat')} size="sm">
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            );
        }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Side Navigation Button - Fixed Position */}
      <Button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed top-16 left-2 z-40 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
        size="sm"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Mobile Side Navigation Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader className="flex items-center justify-between border-b pb-2">
            <DrawerTitle>Navigation</DrawerTitle>
            <Button
              onClick={() => setIsDrawerOpen(false)}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto">
            <SideNavigation 
              activeSection={activeSection} 
              onSectionChange={handleSectionChange}
              username={username}
              onClose={() => setIsDrawerOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <div className="container mx-auto p-3 pb-20 max-w-4xl pt-4">
        {renderContent()}
      </div>

      {/* Floating Chat Button */}
      {username && <FloatingChatButton guestName={username} />}
    </div>
  );
};

export default HomePage;
