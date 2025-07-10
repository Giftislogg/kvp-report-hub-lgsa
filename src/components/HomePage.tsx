
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Users, Mail, Shield, Gamepad2, Globe } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                KASI Vibes Role-Play
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold mb-3">
                Support Center
              </h2>
              <p className="text-base text-blue-100 leading-relaxed">
                Official support platform for LGSA KVRP Server
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-300" />
                <h3 className="font-semibold mb-1">24/7 Support</h3>
                <p className="text-sm text-blue-100">Round-the-clock assistance</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <h3 className="font-semibold mb-1">Active Community</h3>
                <p className="text-sm text-blue-100">Join thousands of players</p>
              </div>
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                <h3 className="font-semibold mb-1">Real-time Chat</h3>
                <p className="text-sm text-blue-100">Connect instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KVRP Information Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            About KASI Vibes Role-Play
          </h2>
        </div>

        {/* Game Screenshots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <img 
            src="/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png" 
            alt="KVRP Logo"
            className="w-full h-48 object-cover rounded-lg shadow-lg"
          />
          <img 
            src="/lovable-uploads/83473438-6d97-456d-b1e4-d32294cc5289.png" 
            alt="Los Santos City Hall"
            className="w-full h-48 object-cover rounded-lg shadow-lg"
          />
          <img 
            src="/lovable-uploads/c1db24f0-71bf-4d1c-b819-fb6fc15ec7ab.png" 
            alt="Interior Scene"
            className="w-full h-48 object-cover rounded-lg shadow-lg"
          />
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-4">GTA MZANSI Online Experience</h3>
              <p className="text-gray-600 leading-relaxed">
                With GTAM ONLINE, LGSA brings the heart of the GTA MZANSI experience to a living online world with multiple players. 
                Just what you choose to do in that world, it's up to you.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                The game combines a persistent and continually expanding world full of personalities, with a huge range of both 
                structured and unstructured activities for you to do. After you fly into Los Santos, you're introduced to the world 
                and its many opportunities for earning and spending money.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                You can run around on your own, making friends and enemies, or band together and form a crew.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('report')}>
            <CardHeader className="text-center">
              <FileText className="w-10 h-10 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-blue-800">Submit Report</CardTitle>
              <CardDescription>
                Report issues, bugs, or players with screenshots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Report</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('public-chat')}>
            <CardHeader className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-green-600" />
              <CardTitle className="text-green-800">Public Chat</CardTitle>
              <CardDescription>
                Join the community chat and connect with players
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">Join Chat</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
