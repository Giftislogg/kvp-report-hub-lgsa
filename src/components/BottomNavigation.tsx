
import React from 'react';
import { Home, MessageCircle, FileText, Settings, PenTool } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isStaff?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentPage, 
  onNavigate,
  isStaff
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'posts', label: 'Posts', icon: PenTool },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(isStaff ? [{ id: 'admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex justify-around items-center py-1 px-1">
        {/* Menu button to open side navigation drawer */}
        <Button
          variant="ghost"
          onClick={() => (window as any).dispatchEvent(new Event('open-mobile-menu'))}
          className={`flex flex-col items-center justify-center min-h-[48px] flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50`}
        >
          <MessageCircle size={20} />
          <span className="text-xs mt-1 font-medium">Menu</span>
        </Button>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] flex-1 relative ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
