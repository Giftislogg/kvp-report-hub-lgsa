
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Users, Mail, Shield, Gamepad2 } from "lucide-react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-blue-200" />
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                KASI Vibes Role-Play
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Support Center
              </h2>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Your gateway to the ultimate Grand Theft Auto role-playing experience. 
                Report issues, connect with players, and get support from our dedicated team.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-blue-100">Round-the-clock assistance for all players</p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                <h3 className="text-lg font-semibold mb-2">Active Community</h3>
                <p className="text-blue-100">Join thousands of players in KASI Vibes</p>
              </div>
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                <h3 className="text-lg font-semibold mb-2">Real-time Chat</h3>
                <p className="text-blue-100">Connect instantly with other players</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What is KVRP Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What is KASI Vibes Role-Play?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            KASI Vibes Role-Play (KVRP) is a premium Grand Theft Auto V role-playing server 
            that brings authentic South African culture and lifestyle to the virtual world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800">Immersive Role-Play Experience</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">Authentic South African townships and locations</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">Local language support and cultural elements</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">Custom jobs, businesses, and economy system</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-gray-600">Active police, EMS, and government roles</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
            <Gamepad2 className="w-24 h-24 mx-auto mb-4 text-blue-600" />
            <h4 className="text-xl font-bold text-gray-800 mb-2">Join the Community</h4>
            <p className="text-gray-600 mb-4">
              Experience life in the townships, build relationships, start businesses, 
              and create your own story in our vibrant community.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How Can We Help You?
          </h2>
          <p className="text-lg text-gray-600">
            Choose from our support options to get the assistance you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" onClick={() => onNavigate('report')}>
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-blue-800">Report Form</CardTitle>
              <CardDescription className="text-blue-600">
                Submit bug reports, player reports, or ask questions with optional screenshots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Report</Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100 border-green-200" onClick={() => onNavigate('public-chat')}>
            <CardHeader className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-green-800">Public Chat</CardTitle>
              <CardDescription className="text-green-600">
                Join the server-wide chat room and connect with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700">Join Chat</Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" onClick={() => onNavigate('private-chat')}>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-purple-800">1-on-1 Chat</CardTitle>
              <CardDescription className="text-purple-600">
                Start a private conversation with another player
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Chat</Button>
            </CardContent>
          </Card>

          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200" onClick={() => onNavigate('messages')}>
            <CardHeader className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-3 text-orange-600 group-hover:scale-110 transition-transform" />
              <CardTitle className="text-orange-800">My Messages</CardTitle>
              <CardDescription className="text-orange-600">
                Check messages and responses from administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">View Messages</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">KASI Vibes Role-Play Support Center</h3>
          <p className="text-gray-400 mb-6">
            Official support platform for LGSA KVRP Server
          </p>
          <div className="flex justify-center space-x-6">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Discord
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Forums
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Website
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
