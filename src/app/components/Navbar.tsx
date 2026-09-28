import React from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';
import dixelsLogo from 'figma:asset/247d65801bbc3aad30cb75db0c08362c2b40b62f.png';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'architecture-v2', label: 'Neural Architecture' },
    { id: 'guidelines', label: 'Product Guidelines' },
    { id: 'platform', label: 'Platform Core' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <img 
            src={dixelsLogo} 
            alt="Dixels" 
            className="h-10 w-auto object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-[#5B21B6] hidden sm:block">Dixels Platform</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                currentPage === item.id
                  ? "bg-[#5B21B6]/5 text-[#5B21B6]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#5B21B6]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};