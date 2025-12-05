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
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to determine if a path is active
  const isActive = (path) => {
    if (path === '/') {
      // Dashboard is active only on root path, not on detail pages
      return location.pathname === '/' && !location.pathname.startsWith('/detail');
    }
    return location.pathname === path;
  };

  // Navigation items configuration
  const navItems = [
    {
      icon: <LayoutDashboard className={`w-6 h-6 ${isActive('/') ? 'text-black' : 'text-gray-700 dark:text-gray-300'}`} />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
      className: isActive('/')
      ? '!bg-[#10B981] dark:!bg-[#10B981]'
      : ''
    },
    {
      icon: <History className={`w-6 h-6 ${isActive('/history') ? 'text-black' : 'text-gray-700 dark:text-gray-300'}`} />,
      label: 'Trade History',
      onClick: () => navigate('/history'),
      className: isActive('/history')
        ? '!bg-[#10B981] dark:!bg-[#10B981]'
        : ''
    },
    {
      icon: <Plus className={`w-6 h-6 ${showTradeForm ? 'text-black' : 'text-gray-700 dark:text-gray-300'}`} />,
      label: showTradeForm ? 'Hide Trade Form' : 'New Trade',
      onClick: onToggleTradeForm,
      className: showTradeForm
        ? '!bg-[#10B981] dark:!bg-[#10B981]'
        : ''
    },
    {
      icon: <Tag className={`w-6 h-6 ${isActive('/tags') ? 'text-black' : 'text-gray-700 dark:text-gray-300'}`} />,
      label: 'Tags',
      onClick: () => navigate('/tags'),
      className: isActive('/tags')
        ? '!bg-[#10B981] dark:!bg-[#10B981]'
        : ''
    },
    {
      icon: <TrendingUpDown className={`w-6 h-6 ${isActive('/comparison') ? 'text-black' : 'text-gray-700 dark:text-gray-300'}`} />,
      label: 'Batch Comparison',
      onClick: () => navigate('/comparison'),
      className: isActive('/comparison')
        ? '!bg-[#10B981] dark:!bg-[#10B981]'
        : ''
    }  
  ];

  // Responsive sizing for mobile devices
  const baseItemSize = isMobile ? 44 : 50;
  const magnification = isMobile ? 60 : 70;
  const panelHeight = isMobile ? 60 : 70;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <Dock
        items={navItems}
        className="bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl shadow-emerald-500/10"
        spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
        magnification={magnification}
        distance={200}
        panelHeight={panelHeight}
        dockHeight={256}
        baseItemSize={baseItemSize}
      />
    </div>
  );
};

export default BottomNavDock;

