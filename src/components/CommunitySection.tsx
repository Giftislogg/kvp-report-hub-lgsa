
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import PostCreator from './PostCreator';
import PostsList from './PostsList';

interface CommunitySectionProps {
  username?: string;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ username }) => {
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
    setShowPostCreator(false);
  };

  if (!username) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Posts</h1>
          <p className="text-gray-600">Connect with the KVRP community through posts</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Join the Community</h3>
            <p className="text-gray-500 mb-4">
              Login or create an account to view and create posts, interact with other players.
            </p>
            <Button>Get Started</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Posts</h1>
        <p className="text-gray-600">Share your experiences and connect with fellow KVRP players</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Latest Posts</h2>
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
  );
};

export default CommunitySection;
