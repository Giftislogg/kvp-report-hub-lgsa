import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url: string;
  duration: string;
  created_at: string;
}

const TutorialManager: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    youtube_url: '',
    duration: ''
  });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tutorials:', error);
        return;
      }

      setTutorials(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const extractYouTubeId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleCreateTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTutorial.title.trim() || !newTutorial.youtube_url.trim()) {
      toast.error('Title and YouTube URL are required');
      return;
    }

    const videoId = extractYouTubeId(newTutorial.youtube_url);
    if (!videoId) {
      toast.error('Invalid YouTube URL');
      return;
    }

    try {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      const { error } = await supabase
        .from('tutorials')
        .insert({
          title: newTutorial.title,
          description: newTutorial.description,
          youtube_url: newTutorial.youtube_url,
          thumbnail_url: thumbnailUrl,
          duration: newTutorial.duration || '0 min'
        });

      if (error) {
        console.error('Error creating tutorial:', error);
        toast.error('Failed to create tutorial');
        return;
      }

      toast.success('Tutorial created successfully');
      setNewTutorial({ title: '', description: '', youtube_url: '', duration: '' });
      setIsDialogOpen(false);
      fetchTutorials();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to create tutorial');
    }
  };

  const handleDeleteTutorial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tutorials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tutorial:', error);
        toast.error('Failed to delete tutorial');
        return;
      }

      toast.success('Tutorial deleted successfully');
      fetchTutorials();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to delete tutorial');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Tutorials</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Tutorial</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTutorial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={newTutorial.title}
                    onChange={(e) => setNewTutorial(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter tutorial title..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={newTutorial.description}
                    onChange={(e) => setNewTutorial(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter tutorial description..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube URL</label>
                  <Input
                    value={newTutorial.youtube_url}
                    onChange={(e) => setNewTutorial(prev => ({ ...prev, youtube_url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <Input
                    value={newTutorial.duration}
                    onChange={(e) => setNewTutorial(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 15 min"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Create Tutorial
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tutorials.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tutorials created yet.</p>
          ) : (
            tutorials.map((tutorial) => (
              <div key={tutorial.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <img
                  src={tutorial.thumbnail_url}
                  alt={tutorial.title}
                  className="w-24 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{tutorial.title}</h3>
                  <p className="text-sm text-gray-600">{tutorial.description}</p>
                  <p className="text-xs text-gray-500">Duration: {tutorial.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(tutorial.youtube_url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTutorial(tutorial.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialManager;