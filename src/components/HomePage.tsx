
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to LGSA KVRP Server</h1>
        <p className="text-xl text-muted-foreground">
          Report issues, chat with players, and stay connected
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('report')}>
          <CardHeader>
            <CardTitle>Report Form</CardTitle>
            <CardDescription>Submit bug reports, player reports, or ask questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Submit Report</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('public-chat')}>
          <CardHeader>
            <CardTitle>Public Chat</CardTitle>
            <CardDescription>Join the server-wide chat room</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Join Chat</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('private-chat')}>
          <CardHeader>
            <CardTitle>1-on-1 Chat</CardTitle>
            <CardDescription>Start a private conversation with another player</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('messages')}>
          <CardHeader>
            <CardTitle>My Messages</CardTitle>
            <CardDescription>Check messages from administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Messages</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
