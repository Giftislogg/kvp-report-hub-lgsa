
import React from 'react';
import { Button } from "@/components/ui/button";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  guestName: string | null;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, guestName }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'Report Form' },
    { id: 'public-chat', label: 'Public Chat' },
    { id: 'private-chat', label: '1-on-1 Chat' },
    { id: 'messages', label: 'My Messages' },
    { id: 'admin', label: 'Admin Panel' },
  ];

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">LGSA KVRP Server</h1>
          {guestName && (
            <span className="text-sm bg-primary-foreground/20 px-3 py-1 rounded">
              Welcome, {guestName}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              onClick={() => onNavigate(item.id)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
