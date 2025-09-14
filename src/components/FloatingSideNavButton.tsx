import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import SideNavigation from './SideNavigation';

interface FloatingSideNavButtonProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  username?: string;
}

const FloatingSideNavButton: React.FC<FloatingSideNavButtonProps> = ({
  currentPage,
  onNavigate,
  username
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionChange = (section: string) => {
    onNavigate(section);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Navigation Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full w-12 h-12 p-0"
        size="sm"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Side Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Side Navigation Panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white shadow-xl overflow-hidden">
            {/* Close button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="rounded-full w-8 h-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="h-full">
              <SideNavigation
                activeSection={currentPage}
                onSectionChange={handleSectionChange}
                username={username}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSideNavButton;