
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import SideNavigation from './SideNavigation';
import AnnouncementsSection from './AnnouncementsSection';
import TutorialsSection from './TutorialsSection';
import CommunitySection from './CommunitySection';
import ChatSection from './ChatSection';

interface HomePageProps {
  onNavigate: (page: string) => void;
  username?: string;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onNavigate, 
  username, 
  sidebarOpen = false,
  onCloseSidebar 
}) => {
  const [activeSection, setActiveSection] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsDrawerOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'community':
        return <CommunitySection username={username} />;
      case 'announcements':
        return <AnnouncementsSection username={username} />;
      case 'tutorials':
        return <TutorialsSection />;
      case 'chat':
        return <ChatSection username={username} />;
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="text-center mb-4">
              <div className="bg-black text-white p-4 rounded-lg mb-4">
                <h1 className="text-xl font-bold mb-2">
                  KVRP - KASI Vibes Role-Play
                </h1>
                <p className="text-sm text-gray-300 mb-2">
                  Welcome to the ultimate South African GTA roleplay experience
                </p>
                <p className="text-gray-400 max-w-2xl mx-auto text-xs">
                  With GTAM ONLINE, KVRP brings the heart of the GTA MZANSI experience to a living online world with multiple players. 
                  Just what you choose to do in that world, it's up to you...
                </p>
              </div>
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

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('community')}>
                <CardContent className="p-4 text-center">
                  <h3 className="text-base font-semibold mb-2">Community Posts</h3>
                  <p className="text-gray-600 text-sm">
                    Share your experiences and connect with fellow players
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('chat')}>
                <CardContent className="p-4 text-center">
                  <h3 className="text-base font-semibold mb-2">Chat & Messages</h3>
                  <p className="text-gray-600 text-sm">
                    Create groups and chat with friends
                  </p>
                </CardContent>
              </Card>
            </div>

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
    </div>
  );
};

export default HomePage;
