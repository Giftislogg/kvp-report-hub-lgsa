
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Play, ExternalLink, Clock, MessageCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  thumbnail_url: string;
  duration: string;
  created_at: string;
}

const TutorialsSection: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleVideoClick = (tutorial: Tutorial) => {
    setSelectedVideo(tutorial);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutorials</h1>
        <p className="text-gray-600">Learn everything you need to know about KVRP</p>
      </div>

      {tutorials.length === 0 ? (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tutorials Available</h3>
            <p className="text-gray-500">Tutorials will appear here once they are created by administrators.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <Card 
              key={tutorial.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleVideoClick(tutorial)}
            >
              <div className="relative">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={tutorial.thumbnail_url} 
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
                    Video
                  </span>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{tutorial.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {tutorial.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {tutorial.duration}
                  </div>
                  
                  <Button size="sm" className="flex items-center gap-2">
                    <Play className="w-3 h-3" />
                    Watch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideo.youtube_url)}`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
              {selectedVideo.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedVideo.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Need More Help?</h3>
          <p className="text-blue-700 mb-4">
            Can't find what you're looking for? Check out our comprehensive documentation or join our Discord community.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Visit Docs
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Join Discord
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialsSection;
