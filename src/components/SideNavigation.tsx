
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Megaphone, BookOpen, ChevronRight, Users, UserPlus } from "lucide-react";

interface SideNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  username?: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  activeSection, 
  onSectionChange,
  username 
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
    { id: 'friends', label: 'Friends', icon: Users },
  ];

  // Mock friend suggestions data
  const friendSuggestions = [
    { name: 'Alex Johnson', mutual: 3 },
    { name: 'Sarah Wilson', mutual: 7 },
    { name: 'Mike Davis', mutual: 2 },
    { name: 'Emma Brown', mutual: 5 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
        <nav className="space-y-2 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onSectionChange(item.id)}
                className={`w-full justify-start gap-3 ${
                  isActive 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Button>
            );
          })}
        </nav>

        {/* Friend Suggestions Section */}
        {username && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Friend Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {friendSuggestions.map((friend, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {friend.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{friend.name}</p>
                        <p className="text-xs text-gray-500">{friend.mutual} mutual friends</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  );
};

export default SideNavigation;
