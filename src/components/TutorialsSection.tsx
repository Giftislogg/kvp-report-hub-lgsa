
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, ExternalLink, Clock } from "lucide-react";

const TutorialsSection: React.FC = () => {
  const tutorials = [
    {
      id: 1,
      title: "Getting Started with KVRP",
      description: "Learn the basics of joining and playing on our GTA roleplay server.",
      duration: "15 min",
      type: "video",
      thumbnail: "/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png"
    },
    {
      id: 2,
      title: "Character Creation Guide",
      description: "Step-by-step guide to creating your perfect roleplay character.",
      duration: "10 min",
      type: "article",
    },
    {
      id: 3,
      title: "Server Rules & Guidelines",
      description: "Important rules and guidelines every player should know.",
      duration: "8 min",
      type: "article",
    },
    {
      id: 4,
      title: "How to Use Voice Chat",
      description: "Learn how to properly use voice chat for immersive roleplay.",
      duration: "12 min",
      type: "video",
      thumbnail: "/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png"
    },
    {
      id: 5,
      title: "Economy & Jobs System",
      description: "Understanding the in-game economy and available job opportunities.",
      duration: "20 min",
      type: "video",
      thumbnail: "/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png"
    },
    {
      id: 6,
      title: "Housing & Property Guide",
      description: "Everything you need to know about buying and managing properties.",
      duration: "18 min",
      type: "article",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutorials</h1>
        <p className="text-gray-600">Learn everything you need to know about KVRP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              {tutorial.thumbnail ? (
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={tutorial.thumbnail} 
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                  {tutorial.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-blue-600" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  tutorial.type === 'video' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {tutorial.type === 'video' ? 'Video' : 'Article'}
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
                  {tutorial.type === 'video' ? (
                    <>
                      <Play className="w-3 h-3" />
                      Watch
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3 h-3" />
                      Read
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
