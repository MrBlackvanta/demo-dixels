import React, { useState } from 'react';
import { 
  FileText, 
  MessageSquare, 
  Compass, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2, 
  BarChart3,
  TrendingUp,
  Users,
  Flag,
  Globe,
  Layout,
  Megaphone,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Type,
  List,
  Bold,
  Italic,
  Link as LinkIcon,
  Calendar,
  Clock,
  ChevronRight,
  Shield,
  Ban,
  Lock,
  History,
  Settings,
  UploadCloud
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { format, addDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// --- Types ---

interface CmsPage {
  id: string;
  title: string;
  type: 'Announcement' | 'News Article' | 'Policy' | 'Page';
  author: string;
  lastUpdated: Date;
  status: 'Published' | 'Draft' | 'Archived' | 'Scheduled';
  scheduledFor?: Date;
  content?: string;
  views: number;
}

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  posts: number;
  status: 'Active' | 'Under Review' | 'Suspended';
  lastActivity: string;
  admins: string[];
  privacy: 'Public' | 'Private' | 'Hidden';
}

interface CommunityMember {
  id: string;
  name: string;
  role: 'Admin' | 'Moderator' | 'Member';
  joinedDate: string;
  status: 'Active' | 'Muted' | 'Banned';
}

interface GuideArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  helpful: string;
  status: 'Live' | 'Review Needed' | 'Draft';
  lastUpdated: Date;
}

interface ModerationItem {
  id: number;
  type: 'Community Post' | 'Comment' | 'User Profile' | 'New Community' | 'Guide Edit';
  reason: string;
  author: string;
  content: string;
  date: string;
  status: 'Pending' | 'Resolved' | 'Ignored';
  severity: 'Low' | 'Medium' | 'High';
}

// --- Mock Data ---

const CHART_DATA = [
  { name: 'Mon', views: 2400, engagement: 1400 },
  { name: 'Tue', views: 1398, engagement: 2210 },
  { name: 'Wed', views: 9800, engagement: 2290 },
  { name: 'Thu', views: 3908, engagement: 2000 },
  { name: 'Fri', views: 4800, engagement: 2181 },
  { name: 'Sat', views: 3800, engagement: 2500 },
  { name: 'Sun', views: 4300, engagement: 2100 },
];

const INITIAL_STATS = [
  { label: 'Total Content Items', value: '1,248', change: '+12%', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Communities', value: '42', change: '+3', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Pending Moderation', value: '15', change: '-5', icon: Shield, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Guide Views (30d)', value: '45.2k', change: '+28%', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const INITIAL_MODERATION: ModerationItem[] = [
  { id: 1, type: 'Community Post', reason: 'Harassment Policy Violation', author: 'John Doe', content: 'Discussion about unauthorized parking directed at security staff...', date: '10 mins ago', status: 'Pending', severity: 'High' },
  { id: 2, type: 'Comment', reason: 'Profanity Filter', author: 'Anon', content: 'This is absolute ***** rubbish!', date: '1 hour ago', status: 'Pending', severity: 'Low' },
  { id: 3, type: 'New Community', reason: 'Approval Required', author: 'Sarah Smith', content: 'Request: "Underground Gaming Club"', date: '2 hours ago', status: 'Pending', severity: 'Medium' },
  { id: 4, type: 'Guide Edit', reason: 'Verification Needed', author: 'Mike Ross', content: 'Updated "Visitor Policy" section 4.2 regarding weekend access.', date: '5 hours ago', status: 'Pending', severity: 'Low' },
  { id: 5, type: 'User Profile', reason: 'Inappropriate Avatar', author: 'Dave Wilson', content: 'Uploaded profile picture flagged by AI.', date: '1 day ago', status: 'Pending', severity: 'Medium' },
];

const INITIAL_CMS_PAGES: CmsPage[] = [
  { id: 'p1', title: 'Home Dashboard Banner', type: 'Announcement', author: 'Admin', lastUpdated: new Date(Date.now() - 7200000), status: 'Published', content: 'Welcome to the new TEC Dashboard!', views: 12050 },
  { id: 'p2', title: 'Q4 Town Hall Recap', type: 'News Article', author: 'Comms Team', lastUpdated: new Date(Date.now() - 86400000), status: 'Published', content: 'Key takeaways from our recent town hall meeting...', views: 4500 },
  { id: 'p3', title: 'Holiday Schedule 2024', type: 'Policy', author: 'HR', lastUpdated: new Date(Date.now() - 259200000), status: 'Draft', content: 'The office will be closed on the following dates...', views: 0 },
  { id: 'p4', title: 'New Cafeteria Menu Launch', type: 'Announcement', author: 'Facilities', lastUpdated: new Date(Date.now() - 604800000), status: 'Archived', content: 'Check out the new healthy options at the Smart Cafe.', views: 890 },
  { id: 'p5', title: 'Sustainability Initiative', type: 'Page', author: 'ESG Lead', lastUpdated: new Date(Date.now() - 1209600000), status: 'Scheduled', scheduledFor: addDays(new Date(), 2), content: 'Our commitment to a greener future starts today.', views: 0 },
];

const INITIAL_COMMUNITIES: Community[] = [
  { id: 'c1', name: 'Photography Club', description: 'For shutterbugs and lens lovers.', members: 156, posts: 450, status: 'Active', lastActivity: '5 mins ago', admins: ['Sarah J.', 'Mike T.'], privacy: 'Public' },
  { id: 'c2', name: 'Tech Talks', description: 'Weekly discussions on new tech.', members: 890, posts: 1200, status: 'Active', lastActivity: '1 hour ago', admins: ['CTO Office'], privacy: 'Public' },
  { id: 'c3', name: 'Crypto Enthusiasts', description: 'Blockchain discussion group.', members: 45, posts: 12, status: 'Under Review', lastActivity: '2 days ago', admins: ['CoinFan99'], privacy: 'Private' },
  { id: 'c4', name: 'Running Team', description: 'Marathon training and morning jogs.', members: 67, posts: 340, status: 'Active', lastActivity: '4 hours ago', admins: ['Coach K'], privacy: 'Public' },
  { id: 'c5', name: 'Office Pranks', description: 'Sharing funny office moments.', members: 12, posts: 5, status: 'Suspended', lastActivity: '1 month ago', admins: ['Joker'], privacy: 'Hidden' },
];

const INITIAL_GUIDE_ARTICLES: GuideArticle[] = [
  { id: 'g1', title: 'Visitor Wi-Fi Access', category: 'IT Support', views: 5430, helpful: '98%', status: 'Live', lastUpdated: new Date() },
  { id: 'g2', title: 'Meeting Room Booking Policy', category: 'Facilities', views: 3210, helpful: '92%', status: 'Live', lastUpdated: new Date() },
  { id: 'g3', title: 'Emergency Evacuation Plan', category: 'Safety', views: 890, helpful: '100%', status: 'Live', lastUpdated: new Date() },
  { id: 'g4', title: 'Coffee Machine Instructions', category: 'Pantry', views: 4500, helpful: '85%', status: 'Review Needed', lastUpdated: new Date() },
  { id: 'g5', title: 'Printing from Mac', category: 'IT Support', views: 2100, helpful: '76%', status: 'Live', lastUpdated: new Date() },
];

const MOCK_MEMBERS: CommunityMember[] = [
  { id: 'm1', name: 'Alice Johnson', role: 'Admin', joinedDate: 'Jan 2023', status: 'Active' },
  { id: 'm2', name: 'Bob Smith', role: 'Member', joinedDate: 'Mar 2023', status: 'Active' },
  { id: 'm3', name: 'Charlie Brown', role: 'Moderator', joinedDate: 'Feb 2023', status: 'Active' },
  { id: 'm4', name: 'David Lee', role: 'Member', joinedDate: 'Jun 2023', status: 'Muted' },
  { id: 'm5', name: 'Eve Wilson', role: 'Member', joinedDate: 'Jul 2023', status: 'Banned' },
];

const MOCK_ASSETS = [
    { id: 'a1', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80', name: 'Office.jpg' },
    { id: 'a2', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=80', name: 'Meeting.jpg' },
    { id: 'a3', url: 'https://images.unsplash.com/photo-1629904853716-6c29f4624304?w=300&q=80', name: 'Logo.png' },
    { id: 'a4', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&q=80', name: 'Screen.jpg' },
];

export const ContentManagerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [moderationQueue, setModerationQueue] = useState(INITIAL_MODERATION);
  const [cmsPages, setCmsPages] = useState(INITIAL_CMS_PAGES);
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [guideArticles, setGuideArticles] = useState(INITIAL_GUIDE_ARTICLES);
  const [communityMembers, setCommunityMembers] = useState(MOCK_MEMBERS);

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editorType, setEditorType] = useState<'CMS' | 'Guide'>('CMS');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  
  // Community Detail State
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  // Moderation Dialog State
  const [isModDialogOpen, setIsModDialogOpen] = useState(false);
  const [selectedModItem, setSelectedModItem] = useState<ModerationItem | null>(null);

  // --- Handlers ---

  const handleCreateContent = (type: 'CMS' | 'Guide') => {
    setEditorMode('create');
    setEditorType(type);
    setEditingItem({ title: '', category: '', content: '', status: 'Draft', type: type === 'CMS' ? 'News Article' : 'General' });
    setIsEditorOpen(true);
  };

  const handleEditContent = (item: any, type: 'CMS' | 'Guide') => {
    setEditorMode('edit');
    setEditorType(type);
    setEditingItem({ ...item });
    setIsEditorOpen(true);
  };

  const handleSaveContent = () => {
    if (editorMode === 'create') {
      if (editorType === 'CMS') {
        const newPage: CmsPage = {
          id: `p${Date.now()}`,
          title: editingItem.title || 'Untitled Page',
          type: editingItem.type || 'Page',
          author: 'Admin',
          lastUpdated: new Date(),
          status: editingItem.status || 'Draft',
          content: editingItem.content,
          views: 0,
          scheduledFor: editingItem.scheduledFor
        };
        setCmsPages([newPage, ...cmsPages]);
        toast.success(newPage.status === 'Scheduled' ? "Page scheduled successfully" : "Page created successfully");
      } else {
        const newArticle: GuideArticle = {
          id: `g${Date.now()}`,
          title: editingItem.title || 'Untitled Article',
          category: editingItem.category || 'General',
          views: 0,
          helpful: 'N/A',
          status: editingItem.status || 'Draft',
          lastUpdated: new Date()
        };
        setGuideArticles([newArticle, ...guideArticles]);
        toast.success("Guide article created successfully");
      }
    } else {
      // Edit Mode
      if (editorType === 'CMS') {
        setCmsPages(cmsPages.map(p => p.id === editingItem.id ? { ...editingItem, lastUpdated: new Date() } : p));
        toast.success("Page updated successfully");
      } else {
        setGuideArticles(guideArticles.map(g => g.id === editingItem.id ? { ...editingItem, lastUpdated: new Date() } : g));
        toast.success("Article updated successfully");
      }
    }
    setIsEditorOpen(false);
  };

  const handleDeleteContent = (id: string, type: 'CMS' | 'Guide') => {
    if (type === 'CMS') {
      setCmsPages(cmsPages.filter(p => p.id !== id));
      toast.success("Page deleted");
    } else {
      setGuideArticles(guideArticles.filter(g => g.id !== id));
      toast.success("Article deleted");
    }
  };

  const handleOpenModeration = (item: ModerationItem) => {
    setSelectedModItem(item);
    setIsModDialogOpen(true);
  };

  const handleModerationDecision = (decision: 'approve' | 'reject' | 'ban') => {
    if (!selectedModItem) return;
    
    // Remove from queue
    setModerationQueue(moderationQueue.filter(item => item.id !== selectedModItem.id));
    
    if (decision === 'approve') {
      toast.success("Item approved");
      if (selectedModItem.type === 'New Community') {
         const newComm: Community = {
             id: `c${Date.now()}`,
             name: selectedModItem.content.replace('Request: ', '').replace(/"/g, ''),
             description: 'New community approved via moderation',
             members: 1,
             posts: 0,
             status: 'Active',
             lastActivity: 'Just now',
             admins: [selectedModItem.author],
             privacy: 'Public'
         };
         setCommunities([newComm, ...communities]);
      }
    } else if (decision === 'reject') {
      toast.error("Item rejected/removed");
    } else if (decision === 'ban') {
       toast.error(`User ${selectedModItem.author} has been banned`);
    }
    setIsModDialogOpen(false);
  };

  const handleCommunityAction = (memberId: string, action: 'promote' | 'demote' | 'kick' | 'ban') => {
      // Mock updating member state
      setCommunityMembers(communityMembers.map(m => {
          if (m.id === memberId) {
              if (action === 'promote') return { ...m, role: 'Moderator' };
              if (action === 'demote') return { ...m, role: 'Member' };
              if (action === 'ban') return { ...m, status: 'Banned' };
          }
          return m;
      }));
      toast.success(`Member updated: ${action}`);
  };

  const handleInsertAsset = (asset: any) => {
      const markdownImage = `\n![${asset.name}](${asset.url})\n`;
      setEditingItem({...editingItem, content: (editingItem.content || '') + markdownImage});
      setIsAssetPickerOpen(false);
      toast.success("Image inserted");
  };

  // --- Filtering ---
  
  const filteredCmsPages = cmsPages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCommunities = communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredArticles = guideArticles.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredModeration = moderationQueue.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.author.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- Render Editor ---

  if (isEditorOpen) {
    return (
      <div className="h-full flex flex-col bg-slate-50 font-sans animate-in slide-in-from-right duration-300 fixed inset-0 z-50">
        {/* Editor Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsEditorOpen(false)}>
                 <ArrowLeft size={20} />
              </Button>
              <div>
                 <h2 className="text-lg font-bold text-slate-900">
                    {editorMode === 'create' ? 'Create New' : 'Edit'} {editorType === 'CMS' ? 'Page' : 'Article'}
                 </h2>
                 <p className="text-xs text-slate-500 flex items-center gap-2">
                    {editorMode === 'edit' ? `Last edited: ${format(new Date(), 'MMM d, h:mm a')}` : 'Unsaved Draft'}
                 </p>
              </div>
           </div>
           <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
              <Button className="bg-slate-900 text-white gap-2" onClick={handleSaveContent}>
                 <Save size={16} /> {editingItem.status === 'Scheduled' ? 'Schedule' : 'Save & Publish'}
              </Button>
           </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden flex">
           <div className="flex-1 flex flex-col p-8 max-w-5xl mx-auto w-full overflow-y-auto">
              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="md:col-span-2 space-y-2">
                    <Label>Title</Label>
                    <Input 
                       className="text-lg font-bold" 
                       placeholder="Enter title here..." 
                       value={editingItem.title}
                       onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>{editorType === 'CMS' ? 'Content Type' : 'Category'}</Label>
                    <Select 
                       value={editorType === 'CMS' ? editingItem.type : editingItem.category} 
                       onValueChange={v => editorType === 'CMS' ? setEditingItem({...editingItem, type: v}) : setEditingItem({...editingItem, category: v})}
                    >
                       <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                       </SelectTrigger>
                       <SelectContent>
                          {editorType === 'CMS' ? (
                             <>
                                <SelectItem value="Announcement">Announcement</SelectItem>
                                <SelectItem value="News Article">News Article</SelectItem>
                                <SelectItem value="Policy">Policy</SelectItem>
                                <SelectItem value="Page">Standard Page</SelectItem>
                             </>
                          ) : (
                             <>
                                <SelectItem value="IT Support">IT Support</SelectItem>
                                <SelectItem value="Facilities">Facilities</SelectItem>
                                <SelectItem value="HR">HR</SelectItem>
                                <SelectItem value="Safety">Safety</SelectItem>
                             </>
                          )}
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              {/* Rich Text Toolbar Mock */}
              <div className="border border-slate-200 rounded-lg bg-white shadow-sm flex-1 flex flex-col min-h-[400px]">
                 <div className="border-b border-slate-200 p-2 flex items-center gap-1 bg-slate-50 rounded-t-lg">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Bold size={14}/></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Italic size={14}/></Button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><List size={14}/></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><LinkIcon size={14}/></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsAssetPickerOpen(true)}><ImageIcon size={14}/></Button>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500">HTML Mode</Button>
                 </div>
                 <Textarea 
                    className="flex-1 border-none resize-none p-4 focus-visible:ring-0 text-base leading-relaxed" 
                    placeholder="Start typing your content here..."
                    value={editingItem.content}
                    onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                 />
              </div>
           </div>
           
           {/* Sidebar Settings */}
           <div className="w-80 bg-white border-l border-slate-200 p-6 space-y-6 overflow-y-auto">
              <div>
                 <h3 className="font-bold text-slate-900 mb-4">Publishing Settings</h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label>Status</Label>
                       <Select value={editingItem.status} onValueChange={v => setEditingItem({...editingItem, status: v})}>
                          <SelectTrigger>
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="Draft">Draft</SelectItem>
                             <SelectItem value="Published">Published</SelectItem>
                             <SelectItem value="Scheduled">Scheduled</SelectItem>
                             <SelectItem value="Archived">Archived</SelectItem>
                             {editorType === 'Guide' && <SelectItem value="Live">Live</SelectItem>}
                          </SelectContent>
                       </Select>
                    </div>

                    {editingItem.status === 'Scheduled' && (
                       <div className="space-y-2 p-3 bg-indigo-50 rounded border border-indigo-100">
                          <Label className="text-indigo-900">Schedule Date</Label>
                          <div className="flex items-center gap-2">
                             <Calendar size={14} className="text-indigo-500"/>
                             <Input 
                                type="date" 
                                className="h-8 bg-white" 
                                onChange={(e) => setEditingItem({...editingItem, scheduledFor: new Date(e.target.value)})} 
                             />
                          </div>
                          <div className="text-xs text-indigo-700 pt-1">Will publish automatically</div>
                       </div>
                    )}

                    <div className="space-y-2">
                       <Label>Visibility</Label>
                       <Select defaultValue="public">
                          <SelectTrigger>
                             <SelectValue placeholder="All Employees" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="public">All Employees</SelectItem>
                             <SelectItem value="managers">Managers Only</SelectItem>
                             <SelectItem value="location">Dubai HQ Only</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-2">
                       <Label>Author Override</Label>
                       <Input placeholder="Leave blank for 'Admin'" />
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                 <h4 className="font-bold text-sm mb-2 text-slate-700">SEO Preview</h4>
                 <div className="space-y-1">
                    <div className="text-blue-600 text-sm font-medium hover:underline truncate cursor-pointer">{editingItem.title || 'Untitled Page'}</div>
                    <div className="text-green-700 text-xs">tec.gov.ae/internal/{editorType.toLowerCase()}/...</div>
                    <div className="text-xs text-slate-500 line-clamp-2">
                       {editingItem.content || 'No content description available yet...'}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Asset Picker Dialog */}
        <Dialog open={isAssetPickerOpen} onOpenChange={setIsAssetPickerOpen}>
            <DialogContent className="sm:max-w-[700px] h-[500px] flex flex-col">
               <DialogHeader>
                  <DialogTitle>Select Asset</DialogTitle>
                  <DialogDescription>Choose an image from the Digital Asset Manager</DialogDescription>
               </DialogHeader>
               <ScrollArea className="flex-1 -mx-6 px-6">
                  <div className="grid grid-cols-3 gap-4 pb-4">
                     <div className="border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-slate-50 transition-colors">
                        <UploadCloud size={24} className="text-slate-400 mb-2"/>
                        <span className="text-xs font-medium text-slate-600">Upload New</span>
                     </div>
                     {MOCK_ASSETS.map(asset => (
                        <div key={asset.id} className="border border-slate-200 rounded-lg overflow-hidden h-40 group relative cursor-pointer" onClick={() => handleInsertAsset(asset)}>
                           <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm">
                              Insert
                           </div>
                        </div>
                     ))}
                  </div>
               </ScrollArea>
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAssetPickerOpen(false)}>Cancel</Button>
               </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- Render Community Detail ---

  if (selectedCommunity) {
     return (
        <div className="h-full flex flex-col bg-slate-50 font-sans animate-in slide-in-from-right duration-300">
           <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shrink-0">
               <Button variant="ghost" size="icon" onClick={() => setSelectedCommunity(null)}>
                  <ArrowLeft size={20} />
               </Button>
               <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${selectedCommunity.name}`} />
                  <AvatarFallback>{selectedCommunity.name.substring(0,2)}</AvatarFallback>
               </Avatar>
               <div>
                  <h1 className="text-xl font-bold text-slate-900">{selectedCommunity.name}</h1>
                  <p className="text-xs text-slate-500">{selectedCommunity.members} Members • {selectedCommunity.privacy} Group</p>
               </div>
               <div className="flex-1" />
               <Button variant="outline" className="gap-2">
                  <History size={16} /> Audit Log
               </Button>
               {selectedCommunity.status === 'Active' ? (
                  <Button variant="destructive" className="gap-2">
                     <Ban size={16} /> Suspend Community
                  </Button>
               ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                     <CheckCircle2 size={16} /> Reactivate
                  </Button>
               )}
           </div>

           <div className="flex-1 overflow-y-auto p-8">
               <div className="max-w-5xl mx-auto space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-sm font-medium text-slate-500">Total Posts</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold">{selectedCommunity.posts}</div>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-sm font-medium text-slate-500">Weekly Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold text-emerald-600">+12%</div>
                        </CardContent>
                     </Card>
                     <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-sm font-medium text-slate-500">Reported Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="text-2xl font-bold text-slate-900">0</div>
                        </CardContent>
                     </Card>
                  </div>

                  <Card>
                     <CardHeader>
                        <CardTitle>Member Management</CardTitle>
                        <CardDescription>Manage roles and permissions for this community.</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>User</TableHead>
                                 <TableHead>Role</TableHead>
                                 <TableHead>Joined</TableHead>
                                 <TableHead>Status</TableHead>
                                 <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {communityMembers.map(member => (
                                 <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>
                                       <Badge variant={member.role === 'Admin' ? 'default' : member.role === 'Moderator' ? 'secondary' : 'outline'}>
                                          {member.role}
                                       </Badge>
                                    </TableCell>
                                    <TableCell>{member.joinedDate}</TableCell>
                                    <TableCell>
                                       <span className={cn(
                                          "text-sm font-medium",
                                          member.status === 'Active' ? "text-emerald-600" : "text-red-600"
                                       )}>{member.status}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                             <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                             <DropdownMenuCheckboxItem checked={member.role === 'Admin'} onCheckedChange={() => handleCommunityAction(member.id, 'promote')}>
                                                Admin
                                             </DropdownMenuCheckboxItem>
                                             <DropdownMenuCheckboxItem checked={member.role === 'Moderator'} onCheckedChange={() => handleCommunityAction(member.id, 'promote')}>
                                                Moderator
                                             </DropdownMenuCheckboxItem>
                                             <DropdownMenuCheckboxItem checked={member.role === 'Member'} onCheckedChange={() => handleCommunityAction(member.id, 'demote')}>
                                                Member
                                             </DropdownMenuCheckboxItem>
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem className="text-red-600" onClick={() => handleCommunityAction(member.id, 'kick')}>Kick User</DropdownMenuItem>
                                          </DropdownMenuContent>
                                       </DropdownMenu>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </CardContent>
                  </Card>
               </div>
           </div>
        </div>
     );
  }

  // --- Main View ---

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Manager</h1>
          <p className="text-slate-500 mt-1">Moderate, manage, and publish content across the platform.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => toast.info("Opening preview in new tab...")}>
            <Globe size={16} /> View Live Site
          </Button>
          <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button className="bg-slate-900 text-white gap-2">
                 <Plus size={16} /> Create Content
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Select Content Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCreateContent('CMS')}>
                   <Megaphone size={16} className="mr-2" /> News or Announcement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateContent('Guide')}>
                   <Compass size={16} className="mr-2" /> Guide Article
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateContent('CMS')}>
                   <FileText size={16} className="mr-2" /> Standard Page
                </DropdownMenuItem>
             </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-8 pt-6 pb-2 shrink-0">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-lg w-auto inline-flex">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                <Layout size={16} /> Overview
              </TabsTrigger>
              <TabsTrigger value="cms" className="gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                <Megaphone size={16} /> News & CMS
              </TabsTrigger>
              <TabsTrigger value="communities" className="gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                <MessageSquare size={16} /> Communities
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                <Compass size={16} /> Campus Guide
              </TabsTrigger>
              <TabsTrigger value="moderation" className="gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                <Shield size={16} /> Moderation
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 space-y-8 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {INITIAL_STATS.map((stat, idx) => (
                  <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                          <TrendingUp size={12} /> {stat.change} from last month
                        </p>
                      </div>
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                        <stat.icon size={24} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Engagement Chart */}
              <Card className="border-slate-200 shadow-sm">
                 <CardHeader>
                    <CardTitle>Platform Engagement</CardTitle>
                    <CardDescription>Daily views and active users over the last 7 days.</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#1e293b' }}
                            />
                            <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                        </AreaChart>
                    </ResponsiveContainer>
                 </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Moderation Queue - Compact */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">Moderation Queue</CardTitle>
                      <CardDescription>Items requiring immediate attention</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      {moderationQueue.length} Pending
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {moderationQueue.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Type</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Content / Author</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {moderationQueue.slice(0, 3).map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenModeration(item)}>
                              <TableCell>
                                <Badge variant="outline" className="font-medium text-slate-600">
                                  {item.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-amber-600 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle size={14} /> {item.reason}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-slate-900 line-clamp-1">{item.content}</span>
                                  <span className="text-xs text-slate-500">by {item.author} • {item.date}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                  Review
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle2 size={48} className="mb-4 text-emerald-200" />
                        <p className="font-medium text-slate-900">All caught up!</p>
                        <p className="text-sm">No items currently require moderation.</p>
                      </div>
                    )}
                    {moderationQueue.length > 3 && (
                       <Button variant="ghost" className="w-full mt-4 text-slate-500" onClick={() => setActiveTab('moderation')}>
                          View all {moderationQueue.length} items
                       </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="space-y-6">
                   <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                      <CardHeader>
                         <CardTitle className="text-white">Quick Publish</CardTitle>
                         <CardDescription className="text-indigo-100">Create new content instantly</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                         <Button onClick={() => handleCreateContent('CMS')} className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-start h-10">
                            <Megaphone size={16} className="mr-2" /> New Announcement
                         </Button>
                         <Button onClick={() => handleCreateContent('Guide')} className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-start h-10">
                            <Compass size={16} className="mr-2" /> Add Guide Article
                         </Button>
                      </CardContent>
                   </Card>
                </div>
              </div>
            </TabsContent>

            {/* CMS / PAGES TAB */}
            <TabsContent value="cms" className="mt-0 space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                           <CardTitle>News & CMS Pages</CardTitle>
                           <CardDescription>Manage general content, news, and announcements.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                           <div className="relative w-64">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                              <Input 
                                placeholder="Search pages..." 
                                className="pl-9 h-9" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                              />
                           </div>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Stats</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredCmsPages.map((page) => (
                              <TableRow key={page.id} className="group">
                                 <TableCell className="font-medium">{page.title}</TableCell>
                                 <TableCell>{page.type}</TableCell>
                                 <TableCell>{page.author}</TableCell>
                                 <TableCell>
                                    <Badge variant="outline" className={cn(
                                       "font-normal",
                                       page.status === 'Published' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                       page.status === 'Scheduled' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                       page.status === 'Draft' ? "bg-slate-100 text-slate-600 border-slate-200" :
                                       "bg-amber-50 text-amber-700 border-amber-200"
                                    )}>
                                       {page.status === 'Scheduled' ? `Scheduled: ${format(page.scheduledFor!, 'MMM d')}` : page.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="text-slate-500 text-sm">{page.views > 0 ? `${page.views.toLocaleString()} views` : '-'}</TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditContent(page, 'CMS')}><Edit size={14} /></Button>
                                       <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDeleteContent(page.id, 'CMS')}><Trash2 size={14} /></Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* COMMUNITIES TAB */}
            <TabsContent value="communities" className="mt-0 space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                           <CardTitle>Community Management</CardTitle>
                           <CardDescription>Oversee employee groups, clubs, and moderation settings.</CardDescription>
                        </div>
                        <div className="relative w-64">
                           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                           <Input 
                              placeholder="Search communities..." 
                              className="pl-9 h-9" 
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                           />
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Community Name</TableHead>
                              <TableHead>Members</TableHead>
                              <TableHead>Posts</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Last Activity</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredCommunities.map((comm) => (
                              <TableRow key={comm.id} className="group hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedCommunity(comm)}>
                                 <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                       <AvatarImage src={`https://avatar.vercel.sh/${comm.name}`} />
                                       <AvatarFallback>{comm.name.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    {comm.name}
                                 </TableCell>
                                 <TableCell>{comm.members}</TableCell>
                                 <TableCell>{comm.posts}</TableCell>
                                 <TableCell>
                                    <Badge variant="outline" className={cn(
                                       "font-normal",
                                       comm.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                       comm.status === 'Under Review' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                       "bg-red-50 text-red-700 border-red-200"
                                    )}>
                                       {comm.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="text-slate-500">{comm.lastActivity}</TableCell>
                                 <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ChevronRight size={16}/></Button>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* CAMPUS GUIDE TAB */}
            <TabsContent value="guide" className="mt-0 space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                           <CardTitle>Campus Guide Content</CardTitle>
                           <CardDescription>Manage articles, FAQs, and location information.</CardDescription>
                        </div>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => handleCreateContent('Guide')}>
                           <Plus size={16} /> New Article
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Article Title</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Views</TableHead>
                              <TableHead>Helpfulness</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredArticles.map((article) => (
                              <TableRow key={article.id} className="group">
                                 <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                       <FileText size={14} className="text-slate-400" />
                                       {article.title}
                                    </div>
                                 </TableCell>
                                 <TableCell>{article.category}</TableCell>
                                 <TableCell>{article.views.toLocaleString()}</TableCell>
                                 <TableCell>
                                    <div className="flex items-center gap-2">
                                       <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-teal-500" style={{ width: article.helpful }} />
                                       </div>
                                       <span className="text-xs text-slate-500">{article.helpful}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell>
                                    <Badge variant="outline" className={cn(
                                       "font-normal",
                                       (article.status === 'Live' || article.status === 'Published') ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                       "bg-amber-50 text-amber-700 border-amber-200"
                                    )}>
                                       {article.status}
                                    </Badge>
                                 </TableCell>
                                 <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditContent(article, 'Guide')}><Edit size={14} /></Button>
                                       <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDeleteContent(article.id, 'Guide')}><Trash2 size={14} /></Button>
                                    </div>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* MODERATION TAB - FULL VIEW */}
            <TabsContent value="moderation" className="mt-0 space-y-6 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                           <CardTitle>Global Moderation Queue</CardTitle>
                           <CardDescription>Review reported content and user infractions across all modules.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter size={14} /> Filter
                            </Button>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent>
                     {filteredModeration.length > 0 ? (
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead>Severity</TableHead>
                                 <TableHead>Type</TableHead>
                                 <TableHead>Reason</TableHead>
                                 <TableHead>Content Details</TableHead>
                                 <TableHead>Time</TableHead>
                                 <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {filteredModeration.map((item) => (
                                 <TableRow key={item.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenModeration(item)}>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "font-medium",
                                            item.severity === 'High' ? "bg-red-50 text-red-700 border-red-200" :
                                            item.severity === 'Medium' ? "bg-orange-50 text-orange-700 border-orange-200" :
                                            "bg-blue-50 text-blue-700 border-blue-200"
                                        )}>
                                            {item.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell className="text-slate-700 font-medium">{item.reason}</TableCell>
                                    <TableCell className="max-w-md truncate">
                                        <span className="text-slate-500 text-sm">"{item.content}"</span>
                                        <div className="text-xs text-slate-400 mt-1">Author: {item.author}</div>
                                    </TableCell>
                                    <TableCell className="text-slate-500 whitespace-nowrap">{item.date}</TableCell>
                                    <TableCell className="text-right">
                                       <Button size="sm" className="bg-slate-900 text-white">Review</Button>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                           <Shield size={64} className="mb-4 text-slate-200" />
                           <h3 className="text-lg font-medium text-slate-900">Queue Empty</h3>
                           <p>There are no pending moderation items.</p>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

          </div>
        </Tabs>

        {/* Moderation Dialog */}
        <Dialog open={isModDialogOpen} onOpenChange={setIsModDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Moderation Review</DialogTitle>
                    <DialogDescription>Review the reported content and take action.</DialogDescription>
                </DialogHeader>
                {selectedModItem && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div className="bg-white p-2 rounded shadow-sm">
                                {selectedModItem.type === 'Community Post' ? <MessageSquare size={20} className="text-indigo-500"/> : 
                                 selectedModItem.type === 'Comment' ? <MessageSquare size={20} className="text-slate-500"/> : 
                                 <Users size={20} className="text-teal-500"/>}
                             </div>
                             <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{selectedModItem.type} • {selectedModItem.severity} Severity</div>
                                <div className="text-sm font-medium">Reported for: <span className="text-red-600">{selectedModItem.reason}</span></div>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Content Preview</Label>
                            <div className="p-4 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm leading-relaxed shadow-sm">
                                "{selectedModItem.content}"
                            </div>
                            <div className="text-xs text-slate-400 text-right">Posted by {selectedModItem.author} • {selectedModItem.date}</div>
                        </div>

                        <div className="space-y-2">
                             <Label>Mod Note (Optional)</Label>
                             <Textarea placeholder="Add a note about this decision..." className="h-20" />
                        </div>
                    </div>
                )}
                <DialogFooter className="gap-2 sm:gap-0">
                    <div className="flex gap-2 w-full">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                <Ban size={16} className="mr-2"/> Punish User
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                             <DropdownMenuItem onClick={() => handleModerationDecision('ban')}>Ban User</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleModerationDecision('reject')}>Suspend 24h</DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                       
                       <Button variant="ghost" className="ml-auto" onClick={() => setIsModDialogOpen(false)}>Cancel</Button>
                       <Button variant="destructive" onClick={() => handleModerationDecision('reject')}>
                           <XCircle size={16} className="mr-2" /> Reject
                       </Button>
                       <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleModerationDecision('approve')}>
                           <CheckCircle2 size={16} className="mr-2" /> Approve
                       </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
