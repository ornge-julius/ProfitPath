import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dock from './Dock';
import {
  History,
  LayoutDashboard,
  Tag,
  TrendingUpDown,
  Plus
} from 'lucide-react';

const BottomNavDock = ({ onToggleTradeForm, showTradeForm }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to determine if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' && !location.pathname.startsWith('/detail');
    }
    return location.pathname === path;
  };

  // Navigation items configuration
  const navItems = [
    {
      icon: <LayoutDashboard className={`w-5 h-5 ${isActive('/') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
      className: isActive('/') ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <History className={`w-5 h-5 ${isActive('/history') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'History',
      onClick: () => navigate('/history'),
      className: isActive('/history') ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <Plus className={`w-5 h-5 ${showTradeForm ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: showTradeForm ? 'Close' : 'New Trade',
      onClick: onToggleTradeForm,
      className: showTradeForm ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <Tag className={`w-5 h-5 ${isActive('/tags') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'Tags',
      onClick: () => navigate('/tags'),
      className: isActive('/tags') ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <TrendingUpDown className={`w-5 h-5 ${isActive('/comparison') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'Compare',
      onClick: () => navigate('/comparison'),
      className: isActive('/comparison') ? '!bg-gold !border-gold' : ''
    }  
  ];

  // Responsive sizing for mobile devices
  const baseItemSize = isMobile ? 42 : 48;
  const magnification = isMobile ? 56 : 64;
  const panelHeight = isMobile ? 56 : 64;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <Dock
          items={navItems}
          className="bg-bg-card/95 backdrop-blur-xl border border-border shadow-luxe-lg"
          spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
          magnification={magnification}
          distance={180}
          panelHeight={panelHeight}
          dockHeight={256}
          baseItemSize={baseItemSize}
        />
      </div>
    </div>
  );
};

export default BottomNavDock;
