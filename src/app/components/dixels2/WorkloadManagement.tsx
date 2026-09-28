import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, Calendar as CalendarIcon, 
  MoreHorizontal, Plus, Filter, Search, ChevronRight, Zap, 
  Layout, List, Kanban, BarChart3, Users, ArrowRight, Flag, Layers, 
  Briefcase, CheckSquare, Sparkles, AlertTriangle, CalendarDays,
  GripVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// --- Types & Mock Data ---

type Priority = 'ASAP' | 'High' | 'Medium' | 'Low';
type Status = 'Todo' | 'In Progress' | 'Review' | 'Done';

interface Task {
  id: string;
  title: string;
  project: string;
  priority: Priority;
  status: Status;
  dueDate: string; // ISO date
  assignee: { name: string; avatar: string };
  duration: number; // minutes
  aiScheduled?: boolean;
  scheduledTime?: string; // e.g., "10:00 AM"
}

interface Project {
  id: string;
  title: string;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Delayed';
  dueDate: string;
  team: string[];
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Q3 Financial Report Review', project: 'Finance Q3', priority: 'ASAP', status: 'In Progress', dueDate: '2024-10-25', duration: 90, assignee: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png' }, scheduledTime: '09:00 AM' },
  { id: 't2', title: 'Update Design System Tokens', project: 'Design System', priority: 'High', status: 'Todo', dueDate: '2024-10-26', duration: 120, assignee: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png' } },
  { id: 't3', title: 'Client Presentation Deck', project: 'Sales', priority: 'Medium', status: 'Review', dueDate: '2024-10-27', duration: 45, assignee: { name: 'Mike Ross', avatar: '' } },
  { id: 't4', title: 'Fix Navigation Bug', project: 'Platform', priority: 'High', status: 'Todo', dueDate: '2024-10-24', duration: 60, assignee: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png' }, aiScheduled: true, scheduledTime: '02:00 PM' },
  { id: 't5', title: 'Team Sync Agenda', project: 'Internal', priority: 'Low', status: 'Done', dueDate: '2024-10-23', duration: 15, assignee: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png' }, scheduledTime: '11:30 AM' },
  { id: 't6', title: 'Mobile App Optimizations', project: 'Mobile App', priority: 'High', status: 'Todo', dueDate: '2024-10-28', duration: 180, assignee: { name: 'Mike Ross', avatar: '' } },
  { id: 't7', title: 'Prepare Workshop Slides', project: 'Internal', priority: 'Medium', status: 'Todo', dueDate: '2024-10-29', duration: 90, assignee: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png' } },
];

const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', title: 'Global Rebranding', progress: 75, status: 'On Track', dueDate: 'Nov 15', team: ['SC', 'MR', 'JP'] },
  { id: 'p2', title: 'Mobile App Launch', progress: 45, status: 'At Risk', dueDate: 'Dec 01', team: ['SC', 'AL'] },
  { id: 'p3', title: 'Q4 Strategy', progress: 10, status: 'On Track', dueDate: 'Jan 10', team: ['SC'] },
  { id: 'p4', title: 'Facility Digital Twin', progress: 30, status: 'On Track', dueDate: 'Feb 28', team: ['SC', 'JP', 'AL'] },
];

// --- Sub-Components ---

const TaskCard = ({ task, onStatusChange, onClick }: { task: Task; onStatusChange?: (id: string, status: Status) => void; onClick?: () => void }) => {
  const priorityColor = {
    'ASAP': 'text-red-600 bg-red-50 border-red-100',
    'High': 'text-orange-600 bg-orange-50 border-orange-100',
    'Medium': 'text-blue-600 bg-blue-50 border-blue-100',
    'Low': 'text-slate-600 bg-slate-50 border-slate-100'
  };

  return (
    <motion.div 
      layoutId={task.id}
      className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-teal-200 hover:shadow-sm transition-all mb-2 relative overflow-visible cursor-pointer"
      onClick={onClick}
    >
      {task.aiScheduled && (
        <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-bl from-teal-400 to-transparent" />
      )}
      
      <div className="flex items-center gap-3">
        <DropdownMenu>
           <DropdownMenuTrigger asChild>
              <div 
                  className={cn("w-1 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform", task.status === 'Done' ? 'bg-emerald-500' : 'bg-slate-200 hover:bg-teal-500')} 
                  onClick={(e) => e.stopPropagation()} 
              />
           </DropdownMenuTrigger>
           <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'Todo'); }}>To Do</DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'In Progress'); }}>In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'Review'); }}>Review</DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, 'Done'); }}>Done</DropdownMenuItem>
           </DropdownMenuContent>
        </DropdownMenu>

        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500" onClick={(e) => e.stopPropagation()}>
           <GripVertical size={14} />
        </div>
        <div>
          <h4 className={cn("text-sm font-medium text-slate-900", task.status === 'Done' && "line-through text-slate-400")}>{task.title}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-medium text-slate-700">{task.project}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {task.duration}m</span>
            {task.scheduledTime && (
               <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-full text-[10px]">
                 @{task.scheduledTime}
               </span>
            )}
            {task.aiScheduled && (
              <span className="flex items-center gap-1 text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full text-[10px]">
                <Zap size={8} fill="currentColor" /> AI Auto-Scheduled
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
         <Badge variant="outline" className={cn("border-0 text-[10px] font-bold uppercase", priorityColor[task.priority])}>
            {task.priority}
         </Badge>
         <Avatar className="h-6 w-6 border border-slate-100">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback className="text-[10px]">{task.assignee.name.charAt(0)}</AvatarFallback>
         </Avatar>
      </div>
    </motion.div>
  );
};

const ProjectCard = ({ project }: { project: Project }) => (
  <Card className="hover:border-teal-200 transition-colors cursor-pointer group flex flex-col h-full">
    <CardHeader className="pb-3 pt-4 px-4">
      <div className="flex justify-between items-start">
        <Badge variant="outline" className={cn(
          "mb-2 border-0 font-medium",
          project.status === 'At Risk' ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
        )}>
          {project.status}
        </Badge>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-slate-400 group-hover:text-slate-600"><MoreHorizontal size={14} /></Button>
      </div>
      <CardTitle className="text-sm font-bold text-slate-900">{project.title}</CardTitle>
      <CardDescription className="text-xs">Due {project.dueDate}</CardDescription>
    </CardHeader>
    <CardContent className="px-4 pb-4 mt-auto">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" indicatorClassName={project.status === 'At Risk' ? 'bg-red-500' : 'bg-teal-500'} />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            {project.team.map((initial, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-white ring-1 ring-slate-100">
                 <AvatarFallback className="text-[9px] bg-slate-100 text-slate-600 font-bold">{initial}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-teal-600 transition-colors">
            View Details <ArrowRight size={10} />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AIInsightCard = ({ onAction }: { onAction: () => void }) => (
  <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={100} /></div>
    <div className="relative z-10 space-y-4">
      <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-wider">
        <Sparkles size={14} className="text-amber-400" />
        AI Workload Analysis
      </div>
      <div>
        <h3 className="text-lg font-bold leading-tight mb-2">High Risk of Burnout Detected</h3>
        <p className="text-indigo-100 text-sm leading-relaxed">
          Your current velocity suggests you will miss the <strong>Mobile App Launch</strong> deadline. 
          Sarah is at 115% capacity this week.
        </p>
      </div>
      <div className="pt-2 flex gap-3">
        <Button size="sm" onClick={onAction} className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 font-semibold shadow-none">
          Rebalance Workload
        </Button>
        <Button size="sm" variant="outline" className="bg-transparent border-indigo-400 text-white hover:bg-white/10">
          View Details
        </Button>
      </div>
    </div>
  </div>
);

const NewTaskDialog = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (task: Partial<Task>) => void }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');

    const handleSave = () => {
        onSave({ title, priority, status: 'Todo', project: 'General' });
        setTitle('');
        setPriority('Medium');
        onClose();
    };

    return (
        <Card className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md shadow-2xl transition-all duration-200", isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
             <CardHeader>
                 <CardTitle>Create New Task</CardTitle>
                 <CardDescription>Add a new item to your workload.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Task Title</label>
                     <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Review Quarterly Goals" />
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Priority</label>
                     <div className="flex gap-2">
                         {(['ASAP', 'High', 'Medium', 'Low'] as Priority[]).map(p => (
                             <Badge 
                                key={p} 
                                variant={priority === p ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => setPriority(p)}
                             >
                                {p}
                             </Badge>
                         ))}
                     </div>
                 </div>
             </CardContent>
             <CardFooter className="flex justify-end gap-2">
                 <Button variant="ghost" onClick={onClose}>Cancel</Button>
                 <Button onClick={handleSave} disabled={!title}>Create Task</Button>
             </CardFooter>
        </Card>
    );
};

const KanbanColumn = ({ title, tasks, status, onStatusChange, onTaskClick }: { title: string, tasks: Task[], status: Status, onStatusChange: (id: string, status: Status) => void; onTaskClick: (task: Task) => void }) => (
    <div className="flex-1 min-w-[300px] flex flex-col bg-slate-50/50 rounded-xl border border-slate-200 h-full max-h-full">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-700">{title}</h4>
            <Badge variant="secondary" className="bg-white">{tasks.length}</Badge>
        </div>
        <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
                {tasks.map(task => <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onClick={() => onTaskClick(task)} />)}
            </div>
        </ScrollArea>
    </div>
);

const NewProjectDialog = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (project: Partial<Project>) => void }) => {
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSave = () => {
        onSave({ title, dueDate, status: 'On Track', progress: 0, team: ['SC'] });
        setTitle('');
        setDueDate('');
        onClose();
    };

    return (
        <Card className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md shadow-2xl transition-all duration-200", isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
             <CardHeader>
                 <CardTitle>Create New Project</CardTitle>
                 <CardDescription>Launch a new initiative.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Project Title</label>
                     <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q4 Marketing Campaign" />
                 </div>
                 <div className="space-y-2">
                     <label className="text-sm font-medium">Due Date</label>
                     <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                 </div>
             </CardContent>
             <CardFooter className="flex justify-end gap-2">
                 <Button variant="ghost" onClick={onClose}>Cancel</Button>
                 <Button onClick={handleSave} disabled={!title}>Create Project</Button>
             </CardFooter>
        </Card>
    );
};

// --- Main Component ---

export const WorkloadManagement: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');

  const handleTaskClick = (task: Task) => {
      setSelectedTask(task);
      setIsDetailOpen(true);
  };

  const handleAddTask = (newTask: Partial<Task>) => {
      const task: Task = {
          id: `new-${Date.now()}`,
          title: newTask.title || 'Untitled',
          project: newTask.project || 'General',
          priority: newTask.priority || 'Medium',
          status: 'Todo',
          dueDate: new Date().toISOString().split('T')[0],
          duration: 30,
          assignee: { name: 'Sarah Chen', avatar: 'https://github.com/shadcn.png' },
          ...newTask
      };
      setTasks(prev => [task, ...prev]);
      toast.success("Task created successfully");
  };

  const handleAddProject = (newProject: Partial<Project>) => {
      const project: Project = {
          id: `p-new-${Date.now()}`,
          title: newProject.title || 'Untitled Project',
          progress: 0,
          status: 'On Track',
          dueDate: newProject.dueDate || 'TBD',
          team: ['SC'],
          ...newProject
      } as Project;
      setProjects(prev => [project, ...prev]);
      toast.success("Project launched successfully");
  };

  const handleStatusChange = (taskId: string, newStatus: Status) => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success("Task status updated");
  };

  const handleAutoSchedule = () => {
    setIsOptimizing(true);
    
    // Simulate AI thinking
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'AI Engine: Analyzing dependencies and team availability...',
      success: () => {
        setIsOptimizing(false);
        
        // Update tasks with new schedules
        setTasks(prev => prev.map(t => {
          if (!t.scheduledTime && t.status === 'Todo') {
             return {
               ...t,
               aiScheduled: true,
               scheduledTime: ['01:00 PM', '03:30 PM', '04:00 PM'][Math.floor(Math.random() * 3)]
             };
          }
          return t;
        }));
        
        return 'Schedule Optimized! 3 unscheduled tasks were assigned slots.';
      },
      error: 'Optimization failed'
    });
  };

  const handleRebalance = () => {
     toast.success("Workload Rebalanced: Assigned 2 tasks to Mike to relieve Sarah.");
  };

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
  });

  const pendingTasks = filteredTasks.filter(t => t.status !== 'Done');
  const doneTasks = filteredTasks.filter(t => t.status === 'Done');

  return (
    <div className="w-full h-full flex flex-col px-4 relative bg-slate-50/30">
      <NewTaskDialog 
         isOpen={isTaskModalOpen} 
         onClose={() => setIsTaskModalOpen(false)} 
         onSave={handleAddTask} 
      />
      {isTaskModalOpen && <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setIsTaskModalOpen(false)} />}
      
      <NewProjectDialog 
         isOpen={isProjectModalOpen} 
         onClose={() => setIsProjectModalOpen(false)} 
         onSave={handleAddProject} 
      />
      {isProjectModalOpen && <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={() => setIsProjectModalOpen(false)} />}
      
      {/* Task Details Modal */}
      {isDetailOpen && selectedTask && (
        <>
            <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
                <Card className="shadow-2xl">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                 <CardTitle>{selectedTask.title}</CardTitle>
                                 <CardDescription>Project: {selectedTask.project}</CardDescription>
                             </div>
                             <Badge>{selectedTask.priority}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Avatar><AvatarImage src={selectedTask.assignee.avatar} /><AvatarFallback>SC</AvatarFallback></Avatar>
                                <div>
                                    <div className="text-sm font-bold">{selectedTask.assignee.name}</div>
                                    <div className="text-xs text-slate-500">Assignee</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold">{selectedTask.duration}m</div>
                                <div className="text-xs text-slate-500">Duration</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                                <div className="font-medium text-slate-900">{selectedTask.status}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-slate-400">Due Date</label>
                                <div className="font-medium text-slate-900">{selectedTask.dueDate}</div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>Close</Button>
                        <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100">Delete Task</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700">Edit Task</Button>
                    </CardFooter>
                </Card>
            </div>
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between py-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Workload
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] h-5">BETA</Badge>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 text-slate-600 h-8 text-xs"
            onClick={handleAutoSchedule}
            disabled={isOptimizing}
          >
            {isOptimizing ? <Zap className="animate-pulse text-amber-500" size={12} /> : <Zap size={12} />}
            {isOptimizing ? 'Optimizing...' : 'Auto-Schedule'}
          </Button>
          <Button onClick={() => setIsTaskModalOpen(true)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm h-8 text-xs">
            <Plus size={14} /> New Task
          </Button>
        </div>
      </div>

      {/* Tabs / Navigation */}
      <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-slate-200 mb-4 flex-shrink-0">
          <TabsList className="bg-transparent p-0 h-auto gap-6 w-full justify-start">
            <TabsTrigger 
              value="overview" 
              className="!bg-transparent !shadow-none data-[state=active]:!bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-0 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Layout size={14} className="mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger 
              value="tasks" 
              className="!bg-transparent !shadow-none data-[state=active]:!bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-0 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <List size={14} className="mr-2" /> My Tasks
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="!bg-transparent !shadow-none data-[state=active]:!bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-0 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Kanban size={14} className="mr-2" /> Projects
            </TabsTrigger>
            <TabsTrigger 
              value="capacity" 
              className="!bg-transparent !shadow-none data-[state=active]:!bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 rounded-none px-0 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <BarChart3 size={14} className="mr-2" /> Capacity
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full pr-6 -mr-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 pr-1">
              
              {/* Left Col: Insight + Stats */}
              <div className="space-y-6">
                <AIInsightCard onAction={handleRebalance} />
                
                <div className="grid grid-cols-2 gap-4">
                    <Card className="border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold text-slate-900 mb-1">{tasks.filter(t => t.status === 'Done').length}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Done</div>
                    </Card>
                    <Card className="border-slate-200 shadow-sm p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold text-slate-900 mb-1">{tasks.length}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</div>
                    </Card>
                </div>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                     <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wide">Upcoming Deadlines</CardTitle>
                        <CalendarDays size={14} className="text-slate-400" />
                     </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {filteredTasks.filter(t => (t.priority === 'ASAP' || t.priority === 'High') && t.status !== 'Done').slice(0, 3).map(task => (
                       <div key={task.id} className="flex items-start gap-3">
                          <div className="bg-red-50 text-red-600 p-1.5 rounded-md mt-0.5">
                             <AlertCircle size={14} />
                          </div>
                          <div>
                             <p className="text-sm font-medium text-slate-900 line-clamp-1">{task.title}</p>
                             <p className="text-xs text-slate-500">Due {task.dueDate}</p>
                          </div>
                       </div>
                     ))}
                  </CardContent>
                </Card>
              </div>

              {/* Middle Col: Today's Focus */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Today's Focus</h3>
                  <span className="text-xs text-slate-500">{pendingTasks.length} Tasks Remaining</span>
                </div>
                
                <AnimatePresence>
                  {pendingTasks.slice(0, 5).map((task) => (
                    <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onClick={() => handleTaskClick(task)} />
                  ))}
                </AnimatePresence>

                <Button variant="ghost" onClick={() => setActiveView('tasks')} className="w-full text-slate-500 hover:text-slate-900 text-sm">
                  View All Tasks <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>

              {/* Right Col: Active Projects */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setActiveView('projects')}><Filter size={14} /></Button>
                </div>

                <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
              </div>

            </div>
          </ScrollArea>
        </TabsContent>

        {/* --- TASKS TAB --- */}
        <TabsContent value="tasks" className="flex-1 mt-0">
          <Card className="h-full border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="relative">
                     <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                     <Input 
                        placeholder="Filter tasks..." 
                        className="pl-9 w-64 h-9 bg-white" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <Button variant="outline" size="sm" className="h-9 gap-2 bg-white">
                            <Filter size={14} /> 
                            {priorityFilter === 'All' ? 'Priority' : priorityFilter}
                         </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setPriorityFilter('All')}>All Priorities</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPriorityFilter('ASAP')}>ASAP</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPriorityFilter('High')}>High</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPriorityFilter('Medium')}>Medium</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPriorityFilter('Low')}>Low</DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
               </div>
               <div className="text-xs text-slate-500">Showing {filteredTasks.length} tasks</div>
            </div>
            
            {/* Conditional Render: List vs Kanban could be toggled here, but sticking to Kanban as default for "Tasks" tab per design */}
            <div className="h-full flex gap-4 p-4 overflow-x-auto bg-slate-50/30">
               <KanbanColumn title="To Do" tasks={filteredTasks.filter(t => t.status === 'Todo')} status="Todo" onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
               <KanbanColumn title="In Progress" tasks={filteredTasks.filter(t => t.status === 'In Progress')} status="In Progress" onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
               <KanbanColumn title="Review" tasks={filteredTasks.filter(t => t.status === 'Review')} status="Review" onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
               <KanbanColumn title="Done" tasks={filteredTasks.filter(t => t.status === 'Done')} status="Done" onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
            </div>
          </Card>
        </TabsContent>

        {/* --- PROJECTS TAB --- */}
        <TabsContent value="projects" className="flex-1 mt-0">
           <ScrollArea className="h-full pr-6 -mr-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 pr-1">
                 {/* Project Creation Card */}
                 <button 
                    onClick={() => setIsProjectModalOpen(true)}
                    className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
                 >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                       <Plus size={20} className="text-slate-400 group-hover:text-teal-600" />
                    </div>
                    <span className="font-bold text-slate-600 group-hover:text-teal-700">New Project</span>
                 </button>
                 {projects.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
           </ScrollArea>
        </TabsContent>

        {/* --- CAPACITY TAB --- */}
        <TabsContent value="capacity" className="flex-1 mt-0">
           <ScrollArea className="h-full pr-6 -mr-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 pr-1">
                
                {/* Team Workload */}
                <Card className="border-slate-200 shadow-sm flex flex-col h-full">
                  <CardHeader>
                     <div className="flex justify-between items-center">
                        <CardTitle>Team Workload Distribution</CardTitle>
                        <Button variant="outline" size="sm" className="h-8">Export Report</Button>
                     </div>
                     <CardDescription>Real-time capacity analysis based on assigned tasks.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                     {[
                        { name: 'Sarah Chen', role: 'Product Lead', cap: 115, tasks: 12, risk: 'High' },
                        { name: 'Mike Ross', role: 'Senior Dev', cap: 85, tasks: 8, risk: 'Low' },
                        { name: 'Jessica P.', role: 'Designer', cap: 45, tasks: 4, risk: 'Low' },
                        { name: 'Alex L.', role: 'QA Lead', cap: 60, tasks: 7, risk: 'Medium' },
                     ].map((member, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                 <Avatar className="h-10 w-10 border border-slate-100">
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <div className="text-sm font-bold text-slate-900">{member.name}</div>
                                    <div className="text-xs text-slate-500">{member.role}</div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className={cn("text-lg font-bold", member.cap > 100 ? "text-red-600" : "text-slate-700")}>{member.cap}%</div>
                                 <div className="text-xs text-slate-400">{member.tasks} active tasks</div>
                              </div>
                           </div>
                           <div className="relative pt-1">
                               <Progress 
                                  value={Math.min(member.cap, 100)} 
                                  className="h-2.5" 
                                  indicatorClassName={cn(
                                     member.cap > 110 ? "bg-red-500" : 
                                     member.cap > 90 ? "bg-amber-500" : 
                                     "bg-emerald-500"
                                  )} 
                               />
                               {member.cap > 100 && (
                                   <div className="absolute top-0 right-0 -mt-1 w-0.5 h-4 bg-red-600 animate-pulse" />
                               )}
                           </div>
                           {member.cap > 110 && (
                              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-md mt-2 border border-red-100">
                                 <AlertTriangle size={14} />
                                 <span className="font-medium">Burnout Risk: High. Consider reassigning tasks to Jessica.</span>
                              </div>
                           )}
                        </div>
                     ))}
                  </CardContent>
                </Card>

                {/* Utilization Trends */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp size={120} />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white">Resource Forecast</CardTitle>
                            <CardDescription className="text-slate-400">Predicted capacity needs for next 4 weeks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 flex items-end gap-4 mt-4">
                                {[65, 70, 85, 95, 110, 80, 75, 60].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end group">
                                        <div 
                                            className={cn("w-full rounded-t-sm transition-all duration-500", h > 100 ? "bg-red-500" : "bg-indigo-500 group-hover:bg-indigo-400")} 
                                            style={{ height: `${h}%` }} 
                                        />
                                        <span className="text-[10px] text-slate-500 mt-2 text-center">W{i+1}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex gap-4 text-xs text-slate-400">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Planned Work</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Over Capacity</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Hiring Needs</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-2">
                                 <div className="flex items-center gap-3">
                                     <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                                         <Briefcase size={18} className="text-slate-600" />
                                     </div>
                                     <div>
                                         <div className="text-sm font-bold text-slate-900">Senior Frontend Dev</div>
                                         <div className="text-xs text-slate-500">Department: Engineering</div>
                                     </div>
                                 </div>
                                 <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-100">Approval Pending</Badge>
                             </div>
                             <Button className="w-full mt-2" variant="outline">
                                 <Plus size={14} className="mr-2" /> Request New Resource
                             </Button>
                        </CardContent>
                    </Card>
                </div>

             </div>
           </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
