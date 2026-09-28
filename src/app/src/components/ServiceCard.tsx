import React from 'react';
import { motion } from 'motion/react';
import { ServiceItem } from '../data/architecture';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  item: ServiceItem;
  color: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, color }) => {
  // Ensure Icon is treated as a component
  const Icon = item.icon as LucideIcon;

  const colorStyles: Record<string, string> = {
    indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900',
    blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900',
    violet: 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-900',
    emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900',
    slate: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900',
  };

  const iconStyles: Record<string, string> = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    violet: 'text-violet-600',
    emerald: 'text-emerald-600',
    slate: 'text-slate-600',
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`
        relative p-4 rounded-lg border transition-colors duration-200
        flex flex-col gap-2 h-full shadow-sm cursor-default group
        ${colorStyles[color] || colorStyles.slate}
      `}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-md bg-white/60 ${iconStyles[color] || iconStyles.slate}`}>
          {Icon && <Icon size={20} />}
        </div>
        <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
      </div>
      
      <p className="text-xs opacity-80 leading-relaxed">
        {item.description}
      </p>
    </motion.div>
  );
};
