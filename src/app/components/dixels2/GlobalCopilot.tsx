import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  ChevronRight,
  Zap,
  Calendar,
  UserPlus,
  Coffee,
  FileText,
  Shield,
  Search,
  ArrowRight,
  Users
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalCopilotProps {
  currentContext: string; // e.g., 'home', 'events', 'visitor', 'cafe'
  onNavigate?: (tab: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'action_card';
  actionData?: any;
}

const CONTEXT_PROMPTS: Record<string, { label: string; icon: any; action: string }[]> = {
  home: [
    { label: "What's on my agenda?", icon: Calendar, action: "Show my schedule for today." },
    { label: "Any urgent alerts?", icon: Zap, action: "Check for urgent system alerts." },
  ],
  events: [
    { label: "Draft new event", icon: Calendar, action: "I need to create a new town hall event." },
    { label: "Find marketing workshops", icon: Search, action: "Search for marketing workshops next month." },
  ],
  visitor: [
    { label: "Register VIP Guest", icon: UserPlus, action: "I have a VIP guest arriving tomorrow." },
    { label: "Check Parking Policy", icon: FileText, action: "What is the policy for visitor parking?" },
  ],
  cafe: [
    { label: "What's for lunch?", icon: Coffee, action: "Show me today's lunch menu." },
    { label: "Order coffee", icon: Coffee, action: "Order a latte for pickup." },
  ],
  cms: [
    { label: "Draft Announcement", icon: FileText, action: "Help me write a new announcement." },
    { label: "Review Moderation", icon: Shield, action: "Show me the moderation queue." },
  ],
  support: [
    { label: "IT Help", icon: Zap, action: "My laptop is running slow." },
    { label: "Request Access", icon: Shield, action: "I need access to the new design tools." },
  ],
  calendar: [
    { label: "Schedule Meeting", icon: Calendar, action: "Book a meeting for tomorrow at 2pm." },
    { label: "Free Rooms?", icon: Search, action: "Find a free meeting room now." },
  ],
  communities: [
     { label: "Find Clubs", icon: Search, action: "What communities can I join?" },
     { label: "My Groups", icon: Users, action: "Show my active community memberships." },
  ],
  dam: [
     { label: "Upload Asset", icon: FileText, action: "I need to upload a new marketing image." },
     { label: "Find Logo", icon: Search, action: "Where is the primary brand logo?" },
  ]
};

const INITIAL_GREETING: Message = {
  id: 'm1',
  role: 'assistant',
  content: "Hi there! I'm your Dixels Copilot. I can help you navigate the workplace, manage content, or answer questions. Where would you like to start?",
  timestamp: new Date(),
};

export const GlobalCopilot: React.FC<GlobalCopilotProps> = ({ currentContext, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Context awareness: When tab changes, suggest relevant help if chat is idle
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      // Logic to add a "Context Switch" marker or system message could go here
      // For now, we'll just let the "Quick Prompts" update naturally
    }
  }, [currentContext]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock AI Response Latency
    setTimeout(() => {
      setIsTyping(false);
      const response = generateMockResponse(text, currentContext);
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const generateMockResponse = (input: string, context: string): Message => {
    const lowerInput = input.toLowerCase();
    let content = "I can certainly help with that. Could you provide a few more details?";
    let actionData = null;
    let type: 'text' | 'action_card' = 'text';

    if (lowerInput.includes('agenda') || lowerInput.includes('schedule')) {
       content = "Here's what your day looks like:";
       type = 'action_card';
       actionData = {
          title: "Today's Agenda",
          items: ["10:00 AM - Design Sync", "1:00 PM - Lunch with Sarah", "3:00 PM - Q4 Planning"]
       };
    } else if (lowerInput.includes('vip') || lowerInput.includes('guest')) {
        content = "I've started a visitor registration draft for you. Please confirm the details.";
        type = 'action_card';
        actionData = {
            title: "Visitor Registration",
            fields: [{ label: "Type", value: "VIP" }, { label: "Date", value: "Tomorrow" }]
        };
        if (onNavigate) onNavigate('visitor');
    } else if (lowerInput.includes('menu') || lowerInput.includes('lunch')) {
        content = "Today's specials at the Smart Cafe look delicious!";
        type = 'action_card';
        actionData = {
            title: "Smart Cafe Menu",
            items: ["Grilled Salmon", "Vegan Buddha Bowl", "Truffle Fries"]
        };
        if (onNavigate) onNavigate('cafe');
    }

    return {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      type,
      actionData
    };
  };

  const getContextPrompts = (ctx: string) => {
      // Map complex IDs to simple context keys
      if (ctx === 'visitors' || ctx === 'vms_admin') return CONTEXT_PROMPTS['visitor'];
      if (ctx === 'drinks') return CONTEXT_PROMPTS['cafe'];
      if (ctx === 'calendar' || ctx === 'dashboard') return CONTEXT_PROMPTS['calendar'];
      if (ctx === 'dam') return CONTEXT_PROMPTS['dam'];
      if (ctx === 'communities') return CONTEXT_PROMPTS['communities'];
      
      return CONTEXT_PROMPTS[ctx] || CONTEXT_PROMPTS['home'];
  };

  const activePrompts = getContextPrompts(currentContext);

  return (
    <>
      {/* Floating Trigger Button (When Closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
          >
             {/* Context Prompt Bubble */}
             <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 text-sm font-medium text-slate-700 hidden group-hover:block animate-in slide-in-from-right-2 fade-in duration-300 whitespace-nowrap">
                {currentContext === 'home' ? 'How can I help you today?' : `Ask about ${currentContext === 'cms' ? 'Content' : currentContext.charAt(0).toUpperCase() + currentContext.slice(1)}...`}
             </div>
             
             <Button 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-2 border-white ring-4 ring-indigo-100 transition-all hover:scale-105 active:scale-95"
                onClick={() => setIsOpen(true)}
             >
                <Sparkles size={24} className="animate-pulse" />
             </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
               "fixed z-50 bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ease-in-out",
               isExpanded 
                  ? "top-6 right-6 bottom-6 w-[450px] rounded-2xl" 
                  : "bottom-6 right-6 w-[380px] h-[600px] rounded-2xl"
            )}
          >
             {/* Header */}
             <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
                      <Sparkles size={14} />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900 text-sm">Dixels Copilot</h3>
                      <p className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> 
                         Online • {currentContext.toUpperCase()} Context
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-1">
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" onClick={() => setIsExpanded(!isExpanded)}>
                      {isExpanded ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
                   </Button>
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => setIsOpen(false)}>
                      <X size={16}/>
                   </Button>
                </div>
             </div>

             {/* Chat Area */}
             <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6">
                   {messages.map((msg, idx) => (
                      <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                         {msg.role === 'assistant' && (
                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                               <Sparkles size={14} className="text-indigo-600" />
                            </div>
                         )}
                         <div className={cn(
                            "max-w-[80%] space-y-2",
                            msg.role === 'user' ? "items-end flex flex-col" : "items-start flex flex-col"
                         )}>
                            <div className={cn(
                               "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                               msg.role === 'user' 
                                  ? "bg-slate-900 text-white rounded-br-none" 
                                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                            )}>
                               {msg.content}
                            </div>
                            
                            {/* Rich Action Cards */}
                            {msg.type === 'action_card' && msg.actionData && (
                               <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm w-full animate-in zoom-in-95 duration-300">
                                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{msg.actionData.title}</div>
                                  {msg.actionData.items && (
                                     <ul className="space-y-1.5">
                                        {msg.actionData.items.map((item: string, i: number) => (
                                           <li key={i} className="text-sm bg-slate-50 px-2 py-1.5 rounded text-slate-700 flex items-center gap-2">
                                              <div className="w-1 h-1 bg-indigo-500 rounded-full" /> {item}
                                           </li>
                                        ))}
                                     </ul>
                                  )}
                                  {msg.actionData.fields && (
                                     <div className="grid grid-cols-2 gap-2">
                                        {msg.actionData.fields.map((f: any, i: number) => (
                                           <div key={i} className="bg-slate-50 p-2 rounded">
                                              <div className="text-[10px] text-slate-400">{f.label}</div>
                                              <div className="text-sm font-medium">{f.value}</div>
                                           </div>
                                        ))}
                                     </div>
                                  )}
                               </div>
                            )}
                         </div>
                      </div>
                   ))}

                   {isTyping && (
                      <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                             <Sparkles size={14} className="text-indigo-600" />
                          </div>
                          <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                             <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                          </div>
                      </div>
                   )}
                </div>
             </ScrollArea>

             {/* Footer / Input */}
             <div className="p-4 bg-white border-t border-slate-100">
                {/* Quick Prompts */}
                {messages.length < 3 && !isTyping && (
                   <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                      {activePrompts.map((prompt, idx) => (
                         <button 
                            key={idx}
                            onClick={() => handleSend(prompt.action)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap border border-indigo-100"
                         >
                            <prompt.icon size={12} />
                            {prompt.label}
                         </button>
                      ))}
                   </div>
                )}

                <div className="relative flex items-center gap-2">
                   <Input 
                      placeholder={`Ask Copilot about ${currentContext === 'cms' ? 'Content' : currentContext}...`}
                      className="pr-10 rounded-full border-slate-200 bg-slate-50 focus:bg-white transition-all shadow-inner"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                   />
                   <Button 
                      size="icon" 
                      className={cn(
                         "absolute right-1 h-8 w-8 rounded-full transition-all duration-200",
                         inputValue.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-200 text-slate-400 hover:bg-slate-300"
                      )}
                      onClick={() => handleSend(inputValue)}
                      disabled={!inputValue.trim()}
                   >
                      <ArrowRight size={14} />
                   </Button>
                </div>
                <div className="text-[10px] text-center text-slate-400 mt-2">
                   AI can make mistakes. Please verify important information.
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
