
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, User, Calendar } from "lucide-react";

interface Post {
  id: string;
  author_name: string;
  title: string;
  content: string;
  likes: number;
  timestamp: string;
}

interface PostsListProps {
  username: string;
}

const PostsList: React.FC<PostsListProps> = ({ username }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchUserLikes();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
        const newPost = payload.new as Post;
        setPosts(prev => [newPost, ...prev]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
        const deletedId = payload.old.id;
        setPosts(prev => prev.filter(post => post.id !== deletedId));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
        const updatedPost = payload.new as Post;
        setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_name', username);

      if (error) {
        console.error('Error fetching user likes:', error);
        return;
      }

      const likedPostIds = new Set(data?.map(like => like.post_id) || []);
      setLikedPosts(likedPostIds);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.has(postId);
    
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_name', username);
        
        // Update local state
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        
        // Update post likes count
        const post = posts.find(p => p.id === postId);
        if (post) {
          await supabase
            .from('posts')
            .update({ likes: Math.max(0, post.likes - 1) })
            .eq('id', postId);
        }
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_name: username
          });
        
        // Update local state
        setLikedPosts(prev => new Set([...prev, postId]));
        
        // Update post likes count
        const post = posts.find(p => p.id === postId);
        if (post) {
          await supabase
            .from('posts')
            .update({ likes: post.likes + 1 })
            .eq('id', postId);
        }
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error("Failed to update like");
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to create one!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {post.author_name}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatTime(post.timestamp)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 ${
                    likedPosts.has(post.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} 
                  />
                  {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PostsList;
