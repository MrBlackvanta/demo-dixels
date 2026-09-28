import React from 'react';
import { motion } from 'motion/react';
import { architectureData, ArchitectureLayer } from '../data/architecture';
import { ServiceCard } from './ServiceCard';

const Connector = () => (
  <div className="flex justify-center items-center -my-2 z-0">
    <div className="h-8 w-px bg-slate-300"></div>
  </div>
);

const LayerSection: React.FC<{ layer: ArchitectureLayer; variants: any; isVertical?: boolean }> = ({ 
  layer, 
  variants,
  isVertical = false 
}) => {
  const bgColors: Record<string, string> = {
    indigo: 'bg-indigo-50/50 border-indigo-200',
    blue: 'bg-blue-50/50 border-blue-200',
    violet: 'bg-violet-50/50 border-violet-200',
    emerald: 'bg-emerald-50/50 border-emerald-200',
    slate: 'bg-slate-100 border-slate-200',
  };

  const headerColors: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-800',
    blue: 'bg-blue-100 text-blue-800',
    violet: 'bg-violet-100 text-violet-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    slate: 'bg-slate-200 text-slate-800',
  };

  return (
    <motion.div 
      variants={variants}
      className={`
        relative rounded-xl border-2 border-dashed p-6
        ${bgColors[layer.color] || bgColors.slate}
        ${isVertical ? 'h-full flex flex-col' : 'w-full'}
      `}
    >
      <div className={`
        absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm
        ${headerColors[layer.color]}
      `}>
        {layer.title}
      </div>

      <div className="mb-4 mt-2 text-sm text-slate-500 italic">
        {layer.description}
      </div>

      <div className={`
        grid gap-4
        ${isVertical 
          ? 'grid-cols-1 flex-grow content-start' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }
      `}>
        {layer.items.map((item) => (
          <ServiceCard key={item.id} item={item} color={layer.color} />
        ))}
      </div>
    </motion.div>
  );
};

export const ArchitectureDiagram: React.FC = () => {
  const getLayer = (id: string) => architectureData.find((l) => l.id === id);

  const uxLayer = getLayer('ux');
  const coreLayer = getLayer('core');
  const dataLayer = getLayer('data');
  const securityLayer = getLayer('security');
  const infraLayer = getLayer('infra');

  if (!uxLayer || !coreLayer || !dataLayer || !securityLayer || !infraLayer) return null;

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
    <div className="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dixels Platform Architecture</h1>
        <p className="text-slate-500">High-Level System Design & Component Interaction</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-3 flex flex-col gap-6">
            <LayerSection layer={uxLayer} variants={itemVariants} />
            <Connector />
            <LayerSection layer={coreLayer} variants={itemVariants} />
            <Connector />
            <LayerSection layer={dataLayer} variants={itemVariants} />
          </div>

          <div className="lg:col-span-1 flex flex-col h-full">
             <LayerSection layer={securityLayer} variants={itemVariants} isVertical={true} />
          </div>
        </div>

        <div className="flex justify-center">
           <div className="h-8 w-px bg-slate-300"></div>
        </div>

        <div className="w-full">
          <LayerSection layer={infraLayer} variants={itemVariants} />
        </div>

      </motion.div>
    </div>
  );
};
