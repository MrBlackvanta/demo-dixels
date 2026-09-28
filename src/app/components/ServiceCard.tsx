import React from 'react';
import { motion } from 'motion/react';
import { ServiceItem } from '../data/architecture';
import { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';

interface ServiceCardProps {
  item: ServiceItem;
  color: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ item, color }) => {
  const Icon = item.icon as LucideIcon;

  const colorStyles: Record<string, string> = {
    indigo: 'bg-white border-indigo-100/50',
    blue: 'bg-white border-blue-100/50',
    violet: 'bg-white border-violet-100/50',
    emerald: 'bg-white border-[#5B21B6]/20',
    slate: 'bg-white border-slate-100/50',
    fuchsia: 'bg-white border-fuchsia-100/50',
    amber: 'bg-white border-[#F59E0B]/30',
    rose: 'bg-white border-rose-100/50',
  };

  const iconStyles: Record<string, string> = {
    indigo: 'text-indigo-600 bg-indigo-50',
    blue: 'text-blue-600 bg-blue-50',
    violet: 'text-violet-600 bg-violet-50',
    emerald: 'text-[#5B21B6] bg-[#5B21B6]/10',
    slate: 'text-slate-600 bg-slate-50',
    fuchsia: 'text-fuchsia-600 bg-fuchsia-50',
    amber: 'text-[#F59E0B] bg-[#F59E0B]/10',
    rose: 'text-rose-600 bg-rose-50',
  };

  const isHighlighted = item.highlight;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300",
        "flex flex-col gap-3 h-full shadow-sm cursor-pointer group",
        isHighlighted 
          ? "bg-[#5B21B6]/5 border-[#5B21B6]/20 ring-1 ring-[#5B21B6]/20" 
          : (colorStyles[color] || colorStyles.slate),
        "hover:shadow-md",
        isHighlighted && "col-span-1 md:col-span-2 lg:col-span-2"
      )}
    >
      <div className="flex flex-row items-start gap-3">
        <div className={cn(
          "p-2.5 rounded-lg flex-shrink-0",
          isHighlighted ? "bg-[#5B21B6]/10 text-[#5B21B6]" : (iconStyles[color] || iconStyles.slate)
        )}>
          {Icon && <Icon size={20} strokeWidth={2} />}
        </div>
        <h3 className={cn(
          "font-bold text-sm leading-snug pt-1",
          isHighlighted ? "text-[#5B21B6]" : "text-slate-800"
        )}>
          {item.title}
        </h3>
      </div>
      
      {item.description && (
        <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
          {item.description}
        </p>
      )}
    </motion.div>
  );
};
