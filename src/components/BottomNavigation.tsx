
import React from 'react';
import { Home, MessageCircle, FileText, Settings, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  notificationCount: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentPage, 
  onNavigate, 
  notificationCount 
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'public-chat', label: 'Chat', icon: MessageCircle },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[60px] flex-1 relative ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
