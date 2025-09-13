import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  category: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Discord Community Bot',
    description: 'A powerful Discord bot for managing gaming communities with roleplay features',
    url: 'https://discord-bot-hub.lovable.app/',
    image: '/lovable-uploads/83473438-6d97-456d-b1e4-d32294cc5289.png',
    category: 'Community'
  },
  {
    id: '2',
    title: 'Virtual Trading Platform',
    description: 'Trade virtual items and currencies in a secure marketplace environment',
    url: 'https://trading-platform.lovable.app/',
    image: '/lovable-uploads/c1db24f0-71bf-4d1c-b819-fb6fc15ec7ab.png',
    category: 'Trading'
  },
  {
    id: '3',
    title: 'Gaming Statistics Tracker',
    description: 'Track your gaming performance and compete with friends across multiple games',
    url: 'https://stats-tracker.lovable.app/',
    image: '/lovable-uploads/f1ad0c6c-6319-448e-9962-50117e77175c.png',
    category: 'Analytics'
  }
];

interface ProjectsSectionProps {
  onClose?: () => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onClose }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Support Our Projects
        </h2>
        <p className="text-gray-600 mt-2">
          Discover other amazing Lovable projects and help support their development
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {project.category}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(project.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-purple-700 mb-2">Want to Support Us?</h3>
          <p className="text-purple-600 mb-4">
            Your donations help us maintain servers, develop new features, and create amazing experiences for the community.
          </p>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => window.open('https://ko-fi.com/kvrp', '_blank')}
          >
            <Heart className="w-4 h-4 mr-2" />
            Donate Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsSection;