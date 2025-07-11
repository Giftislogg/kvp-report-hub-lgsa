
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PostCreator from './PostCreator';
import PostsList from './PostsList';
import SideNavigation from './SideNavigation';
import AnnouncementsSection from './AnnouncementsSection';
import TutorialsSection from './TutorialsSection';
import FriendsSection from './FriendsSection';

interface HomePageProps {
  onNavigate: (page: string) => void;
  username?: string;
  sidebarOpen?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, username, sidebarOpen = true }) => {
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
      case 'friends':
        return <FriendsSection username={username} />;
      default:
        return (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="bg-black text-white p-8 rounded-lg mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  KVRP - KASI Vibes Role-Play
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-4">
                  Welcome to the ultimate South African GTA roleplay experience
                </p>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  With GTAM ONLINE, KVRP brings the heart of the GTA MZANSI experience to a living online world with multiple players. 
                  Just what you choose to do in that world, it's up to you...
                </p>
              </div>
            </div>

            {/* Screenshots Gallery - Only first image */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden max-w-2xl mx-auto">
                <img 
                  src="/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png" 
                  alt="KVRP Screenshot 1" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Community Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center">Join Our Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Connect with fellow players, share your experiences, and stay updated with the latest news from KVRP.
                </p>
                <Button 
                  onClick={() => window.open('https://lgsa-tm.com', '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Visit LGSA-TM.com
                </Button>
              </CardContent>
            </Card>

            {/* Posts Section */}
            {username && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Community Posts</h2>
                  <Button 
                    onClick={() => setShowPostCreator(!showPostCreator)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Post
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
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Join the Community</h3>
                  <p className="text-gray-600 mb-4">
                    Login or create an account to view and create posts, chat with other players, and access all features.
                  </p>
                  <div className="space-x-2">
                    <Button onClick={() => onNavigate('public-chat')}>
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {sidebarOpen && (
        <SideNavigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          username={username}
        />
      )}
      <div className="flex-1 container mx-auto p-4 pb-20">
        {renderContent()}
      </div>
    </div>
  );
};

export default HomePage;
