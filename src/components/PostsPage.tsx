import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, Plus } from "lucide-react";
import PostCreator from './PostCreator';
import PostsList from './PostsList';

interface PostsPageProps {
  username?: string;
}

const PostsPage: React.FC<PostsPageProps> = ({ username }) => {
  const [showCreator, setShowCreator] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!username) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-muted-foreground mb-4">
              Please login to view and create posts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PenTool className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Community Posts</h1>
        </div>
        
        {!showCreator && (
          <Button onClick={() => setShowCreator(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Post
          </Button>
        )}
      </div>

      {/* Post Creator */}
      {showCreator && (
        <div className="mb-6">
          <PostCreator
            username={username}
            onPostCreated={handlePostCreated}
            onClose={() => setShowCreator(false)}
          />
        </div>
      )}

      {/* Posts List */}
      <PostsList key={refreshKey} username={username} />
    </div>
  );
};

export default PostsPage;