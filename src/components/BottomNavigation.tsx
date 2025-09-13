
import React, { useEffect, useState } from 'react';
import { Home, MessageCircle, FileText, Settings, PenTool, Shield, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminPanel from "@/components/AdminPanel";

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isStaff?: boolean;
  username?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentPage, 
  onNavigate,
  isStaff,
  username
}) => {
  const [adminOpen, setAdminOpen] = useState(false);
  const [isUserStaff, setIsUserStaff] = useState(false);

  useEffect(() => {
    const checkStaffStatus = async () => {
      if (!username) {
        setIsUserStaff(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from("user_badges")
          .select("staff")
          .eq("user_name", username)
          .maybeSingle();
        setIsUserStaff(!!data?.staff);
      } catch (error) {
        console.error('Error checking staff status:', error);
        setIsUserStaff(false);
      }
    };
    checkStaffStatus();
  }, [username]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'posts', label: 'Posts', icon: PenTool },
    { id: 'donations', label: 'Donate', icon: Heart },
    ...(isUserStaff ? [{ id: 'admin', label: 'Admin', icon: Shield }] : [{ id: 'report', label: 'Report', icon: FileText }]),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-md border-t border-gray-200 z-50 safe-area-pb shadow-2xl">
        <div className="flex justify-around items-center py-2 px-2">
          {/* Menu button to open side navigation drawer */}
          <Button
            variant="ghost"
            onClick={() => (window as any).dispatchEvent(new Event('open-mobile-menu'))}
            className={`flex flex-col items-center justify-center min-h-[60px] flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-200 hover:scale-105`}
          >
            <MessageCircle size={26} className="mb-1" />
            <span className="text-sm font-semibold">Menu</span>
          </Button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => {
                  if (item.id === 'admin' && isUserStaff) {
                    setAdminOpen(true);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center min-h-[60px] flex-1 relative rounded-xl transition-all duration-200 hover:scale-105 ${
                  isActive 
                    ? 'text-blue-600 bg-gradient-to-t from-blue-100 to-blue-50 shadow-lg' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/80'
                }`}
              >
                <Icon size={26} className="mb-1" />
                <span className="text-sm font-semibold">{item.label}</span>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Admin Panel</DialogTitle>
          </DialogHeader>
          <div className="h-full overflow-y-auto px-6 pb-6">
            <AdminPanel skipPassword />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BottomNavigation;
