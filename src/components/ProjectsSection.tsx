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
    <div className="space-y-4 h-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Loot Vault Hub - Support Our Network
        </h2>
        <p className="text-gray-600 mt-2">
          Explore our main project and help support the entire network
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <iframe
          src="https://loot-vault-hub.lovable.app/"
          className="w-full h-full border-0"
          title="Loot Vault Hub"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};

export default ProjectsSection;