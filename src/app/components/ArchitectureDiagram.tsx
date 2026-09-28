import React, { useState } from 'react';
import { motion } from 'motion/react';
import { architectureData, ArchitectureLayer } from '../data/architecture';
import { ServiceCard } from './ServiceCard';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from './ui/utils';
import dixelsLogo from 'figma:asset/9f53d17a87279608a23eeb51f031fced95665ac0.png';
import exampleImage from 'figma:asset/0cb12738c5cdc90c32a7ee5764ac6bad4310c16f.png';

const Connector: React.FC<{ orientation?: 'vertical' | 'horizontal'; className?: string }> = ({ orientation = 'vertical', className }) => (
  <div className={cn(
    "flex justify-center items-center z-0 relative",
    orientation === 'vertical' ? "py-2 h-8" : "px-2 w-8 h-auto",
    className
  )}>
    {orientation === 'vertical' ? (
      <>
        <div className="absolute inset-y-0 w-px bg-gradient-to-b from-slate-200 to-slate-200" />
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="z-10 bg-white p-1 rounded-full border border-slate-100 shadow-sm text-slate-300"
        >
          <ArrowDown size={12} />
        </motion.div>
      </>
    ) : (
      <>
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-slate-200 to-slate-200" />
        <motion.div 
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="z-10 bg-white p-1 rounded-full border border-slate-100 shadow-sm text-slate-300"
        >
          <ArrowRight size={12} />
        </motion.div>
      </>
    )}
  </div>
);

const LayerSection: React.FC<{ 
  layer: ArchitectureLayer; 
  variants: any; 
  isActive?: boolean;
  className?: string;
  gridCols?: string;
  onHover: (id: string | null) => void;
}> = ({ 
  layer, 
  variants,
  isActive = false,
  className,
  gridCols,
  onHover
}) => {
  const bgColors: Record<string, string> = {
    indigo: 'bg-indigo-50/40 border-indigo-100 hover:border-indigo-200',
    blue: 'bg-blue-50/40 border-blue-100 hover:border-blue-200',
    violet: 'bg-violet-50/40 border-violet-100 hover:border-violet-200',
    emerald: 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-200',
    slate: 'bg-slate-100/50 border-slate-100 hover:border-slate-200',
    fuchsia: 'bg-fuchsia-50/40 border-fuchsia-100 hover:border-fuchsia-200',
    amber: 'bg-amber-50/40 border-amber-100 hover:border-amber-200',
    rose: 'bg-rose-50/40 border-rose-100 hover:border-rose-200',
    teal: 'bg-teal-50/40 border-teal-100 hover:border-teal-200',
  };

  const headerColors: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-800',
    blue: 'bg-blue-100 text-blue-800',
    violet: 'bg-violet-100 text-violet-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    slate: 'bg-slate-200 text-slate-800',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-800',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
    teal: 'bg-teal-100 text-teal-800',
  };

  const ringColors: Record<string, string> = {
    indigo: 'ring-indigo-200',
    blue: 'ring-blue-200',
    violet: 'ring-violet-200',
    emerald: 'ring-emerald-200',
    slate: 'ring-slate-200',
    fuchsia: 'ring-fuchsia-200',
    amber: 'ring-amber-200',
    rose: 'ring-rose-200',
    teal: 'ring-teal-200',
  };

  return (
    <motion.div 
      variants={variants}
      className={cn(
        "relative rounded-xl border p-5 transition-all duration-300",
        bgColors[layer.color] || bgColors.slate,
        // Removed the active/dimmed logic styles
        className
      )}
      onMouseEnter={() => onHover(layer.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={cn(
        "absolute -top-3 left-5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm z-20",
        headerColors[layer.color] || headerColors.slate
      )}>
        {layer.title}
      </div>

      {layer.description && (
        <div className="mb-5 mt-1 text-sm text-slate-500 font-medium flex items-center gap-2">
          {layer.description}
        </div>
      )}

      <div className={cn(
        "grid gap-4",
        gridCols ? gridCols : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      )}>
        {layer.items.map((item) => (
          <ServiceCard key={item.id} item={item} color={layer.color} />
        ))}
      </div>
    </motion.div>
  );
};

export const ArchitectureDiagram: React.FC = () => {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);

  const getLayer = (id: string) => architectureData.find((l) => l.id === id);

  const userLayer = getLayer('user_layer');
  const aiLayer = getLayer('ai_intelligence');
  const coreLayer = getLayer('core_modules');
  const integrationLayer = getLayer('integration');
  const externalLayer = getLayer('external');
  const infraLayer = getLayer('infrastructure');

  if (!userLayer || !aiLayer || !coreLayer || !integrationLayer || !externalLayer || !infraLayer) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center bg-white/30">
      <div className="mb-12 text-center max-w-4xl">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="flex flex-col items-center"
        >
          <img 
            src={dixelsLogo} 
            alt="Dixels Platform Logo" 
            className="h-16 md:h-20 object-contain mb-6"
          />
          
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold tracking-widest uppercase border border-teal-200">
            System Architecture V2.0
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            The Connected Building Persona
          </h1>
          <p className="text-slate-500 leading-relaxed max-w-2xl">
            A scalable, modular platform where physical infrastructure meets digital intelligence—powered by the Neural Interface.
          </p>
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full flex flex-col gap-1 items-stretch relative"
      >
        {/* 1. USER LAYER */}
        <LayerSection 
          layer={userLayer} 
          variants={itemVariants} 
          onHover={setHoveredLayer}
          gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        />
        <Connector />

        {/* 2. AI LAYER */}
        <LayerSection 
          layer={aiLayer} 
          variants={itemVariants} 
          onHover={setHoveredLayer}
          gridCols="grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
        />
        <Connector />

        {/* 3. CORE MODULES - Complex Grid */}
        <LayerSection 
          layer={coreLayer} 
          variants={itemVariants} 
          onHover={setHoveredLayer}
          gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        />
        <Connector />

        {/* 4. INTEGRATION */}
        <LayerSection 
          layer={integrationLayer} 
          variants={itemVariants} 
          onHover={setHoveredLayer}
          gridCols="grid-cols-2 md:grid-cols-4"
        />
        <Connector />

        {/* 5. EXTERNAL SYSTEMS */}
        <LayerSection 
          layer={externalLayer} 
          variants={itemVariants} 
          onHover={setHoveredLayer}
          gridCols="grid-cols-2 md:grid-cols-4"
        />
        <Connector />

        {/* 6. INFRASTRUCTURE */}
        <LayerSection 
          layer={infraLayer} 
          variants={itemVariants} 
          onHover={setHoveredLayer}
          gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          className="bg-emerald-50/30 border-emerald-100"
        />

      </motion.div>
      
      <div className="mt-16 text-center text-slate-400 text-xs uppercase tracking-widest">
        <p>© 2025 Dixels Platform</p>
      </div>
    </div>
  );
};