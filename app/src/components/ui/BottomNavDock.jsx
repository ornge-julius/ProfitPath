import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dock from './Dock';
import {
  History,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
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

  // Primary navigation only — daily trading workflow lives in the dock,
  // configuration-style pages (Tags, Accounts, Settings) live in the header menu
  const navItems = [
    {
      icon: <LayoutDashboard className={`w-5 h-5 ${isActive('/') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
      isActive: isActive('/'),
      className: isActive('/') ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <CalendarDays className={`w-5 h-5 ${isActive('/calendar') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'Calendar',
      onClick: () => navigate('/calendar'),
      isActive: isActive('/calendar'),
      className: isActive('/calendar') ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <Plus className={`w-5 h-5 ${showTradeForm ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: showTradeForm ? 'Close' : 'New Trade',
      onClick: onToggleTradeForm,
      isActive: showTradeForm,
      className: showTradeForm ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <History className={`w-5 h-5 ${isActive('/history') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'History',
      onClick: () => navigate('/history'),
      isActive: isActive('/history'),
      className: isActive('/history') ? '!bg-gold !border-gold' : ''
    },
    {
      icon: <BarChart3 className={`w-5 h-5 ${isActive('/insights') ? 'text-bg-primary' : 'text-text-secondary'}`} />,
      label: 'Insights',
      onClick: () => navigate('/insights'),
      isActive: isActive('/insights'),
      className: isActive('/insights') ? '!bg-gold !border-gold' : ''
    }
  ];

  // Responsive sizing for mobile devices; 44px is the minimum comfortable touch target
  const baseItemSize = isMobile ? 44 : 48;
  const magnification = isMobile ? 56 : 64;
  const panelHeight = isMobile ? 56 : 64;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
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
