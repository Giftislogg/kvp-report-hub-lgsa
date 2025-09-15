import React, { useState } from 'react';
import SideNavigation from './SideNavigation';

interface FloatingSideNavButtonProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  username: string | undefined;
}

const FloatingSideNavButton: React.FC<FloatingSideNavButtonProps> = ({ currentPage, onNavigate, username }) => {
  const [isSideNavOpen, setSideNavOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setSideNavOpen(true)} 
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg lg:hidden"
      >
        Menu
      </button>
      {isSideNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSideNavOpen(false)}></div>
          <div className="relative bg-white w-80 h-full shadow-lg">
            <SideNavigation 
              activeSection={currentPage}
              onSectionChange={onNavigate}
              username={username}
              onClose={() => setSideNavOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="hidden lg:block fixed top-0 left-0 w-80 h-full shadow-lg">
        <SideNavigation 
          activeSection={currentPage}
          onSectionChange={onNavigate}
          username={username}
        />
      </div>
    </>
  );
};

export default FloatingSideNavButton;
