
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import PostCreator from './PostCreator';
import PostsList from './PostsList';
import SideNavigation from './SideNavigation';
import AnnouncementsSection from './AnnouncementsSection';
import TutorialsSection from './TutorialsSection';

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
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] = useState('home');

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'announcements':
        return <AnnouncementsSection username={username} />;
      case 'tutorials':
        return <TutorialsSection />;
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="text-center mb-6">
              <div className="bg-black text-white p-4 sm:p-6 rounded-lg mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
                  KVRP - KASI Vibes Role-Play
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-3">
                  Welcome to the ultimate South African GTA roleplay experience
                </p>
                <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm">
                  With GTAM ONLINE, KVRP brings the heart of the GTA MZANSI experience to a living online world with multiple players. 
                  Just what you choose to do in that world, it's up to you...
                </p>
              </div>
            </div>

            {/* Main Screenshot */}
            <div className="mb-6">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png" 
                  alt="KVRP Screenshot" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Community Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center text-lg">Join Our Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4 text-sm">
                  Connect with fellow players, share your experiences, and stay updated with the latest news from KVRP.
                </p>
                <Button 
                  onClick={() => window.open('https://lgsa-tm.com', '_blank')}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                >
                  Visit LGSA-TM.com
                </Button>
              </CardContent>
            </Card>

            {/* Posts Section */}
            {username && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold">Community Posts</h2>
                  <Button 
                    onClick={() => setShowPostCreator(!showPostCreator)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Post</span>
                    <span className="sm:hidden">Post</span>
                  </Button>
                </div>

                {showPostCreator && (
                  <PostCreator 
                    username={username}
                    onPostCreated={handlePostCreated}
                    onClose={() => setShowPostCreator(false)}
                  />
                )}

                <PostsList key={refreshKey} username={username} />
              </div>
            )}

            {!username && (
              <Card>
                <CardContent className="p-4 text-center">
                  <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Login or create an account to view and create posts, chat with other players, and access all features.
                  </p>
                  <Button onClick={() => onNavigate('public-chat')}>
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
      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={onCloseSidebar}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SideNavigation 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            username={username}
            onClose={onCloseSidebar}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="container mx-auto p-3 sm:p-4 pb-20 max-w-4xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default HomePage;
