import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Plus, 
  Search,
  Filter,
  Heart,
  Share2,
  MapPin,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  Send,
  Trophy,
  Target,
  Zap,
  Coffee,
  BookOpen,
  Code,
  Music,
  Video,
  ArrowLeft,
  Settings,
  Shield,
  FileText,
  Download,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

// --- Mock Data ---

const COMMUNITIES = [
    { 
        id: 'c1', 
        name: 'Photography Club', 
        category: 'Hobbies', 
        members: 142, 
        isJoined: true,
        desc: 'For shutterbugs and visual storytellers.',
        icon: Video,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'
    },
    { 
        id: 'c2', 
        name: 'Tech Talks', 
        category: 'Professional', 
        members: 850, 
        isJoined: true,
        desc: 'Weekly deep dives into new tech.',
        icon: Code,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80'
    },
    { 
        id: 'c3', 
        name: 'Runners Group', 
        category: 'Wellness', 
        members: 56, 
        isJoined: false,
        desc: 'Morning jogs and marathon training.',
        icon: Zap,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        cover: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&q=80'
    },
    { 
        id: 'c4', 
        name: 'Book Club', 
        category: 'Social', 
        members: 23, 
        isJoined: false,
        desc: 'Monthly fiction and non-fiction discussions.',
        icon: BookOpen,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        cover: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80'
    },
    { 
        id: 'c5', 
        name: 'Coffee Aficionados', 
        category: 'Social', 
        members: 204, 
        isJoined: false,
        desc: 'Exploring the best beans around campus.',
        icon: Coffee,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'
    }
];

const FEED_POSTS = [
    {
        id: 'p1',
        author: 'Sarah Jenkins',
        authorRole: 'Photography Club Lead',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        time: '2 hours ago',
        content: 'Check out the winning shots from last week\'s architecture challenge! The use of light in these is absolutely stunning. 📸✨',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        likes: 42,
        comments: 8,
        communityId: 'c1',
        communityName: 'Photography Club'
    },
    {
        id: 'p2',
        author: 'David Chen',
        authorRole: 'Tech Evangelist',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        time: '5 hours ago',
        content: 'Just uploaded the slide deck from today\'s session on Micro Frontends. Great questions everyone! Let\'s keep the discussion going in the comments.',
        likes: 128,
        comments: 24,
        communityId: 'c2',
        communityName: 'Tech Talks'
    }
];

export const CommunitiesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('feed');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setCreateOpen] = useState(false);
    
    // Derived State
    const myGroups = COMMUNITIES.filter(c => c.isJoined);

    // --- Detailed View Logic ---
    const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

    const handleSelectCommunity = (id: string) => {
        setSelectedCommunityId(id);
    };

    const handleBack = () => {
        setSelectedCommunityId(null);
    };

    const selectedCommunity = COMMUNITIES.find(c => c.id === selectedCommunityId);

    // Filter content for detail view
    const detailPosts = selectedCommunityId ? FEED_POSTS.filter(p => p.communityId === selectedCommunityId) : [];

    if (selectedCommunity) {
        return (
            <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden animate-in slide-in-from-right duration-300">
                {/* Detail Header */}
                <div className="h-64 relative shrink-0">
                    <img src={selectedCommunity.cover} alt={selectedCommunity.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <Button variant="secondary" size="sm" className="absolute top-4 left-4 z-10 gap-2 bg-white/20 hover:bg-white/40 text-white border-none backdrop-blur-md" onClick={handleBack}>
                        <ArrowLeft size={16} /> Back to Communities
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="max-w-6xl mx-auto flex items-end justify-between">
                           <div className="flex items-end gap-6">
                                <div className={cn("w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center bg-white", selectedCommunity.color)}>
                                    <selectedCommunity.icon size={48} />
                                </div>
                                <div className="mb-2">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur mb-2">{selectedCommunity.category}</Badge>
                                    <h1 className="text-4xl font-bold text-white mb-2">{selectedCommunity.name}</h1>
                                    <p className="text-slate-200 text-lg max-w-2xl">{selectedCommunity.desc}</p>
                                </div>
                           </div>
                           <div className="flex items-center gap-3 mb-2">
                                <div className="flex -space-x-3">
                                    {[1,2,3,4].map(i => (
                                        <Avatar key={i} className="border-2 border-slate-900 w-10 h-10">
                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedCommunity.id}${i}`} />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white">
                                        +{selectedCommunity.members - 4}
                                    </div>
                                </div>
                                <Button size="lg" className={cn("gap-2 ml-4", selectedCommunity.isJoined ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-teal-600 hover:bg-teal-700 text-white")} onClick={() => toast.success(selectedCommunity.isJoined ? "Notifications settings updated" : "Welcome to the club!")}>
                                    {selectedCommunity.isJoined ? <Settings size={18}/> : <Plus size={18}/>}
                                    {selectedCommunity.isJoined ? "Manage Membership" : "Join Community"}
                                </Button>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto p-6 grid grid-cols-3 gap-8">
                        <div className="col-span-2 space-y-6">
                            <Tabs defaultValue="feed">
                                <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent p-0 h-auto gap-6">
                                    <TabsTrigger value="feed" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-teal-700">Discussion Board</TabsTrigger>
                                    <TabsTrigger value="resources" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-teal-700">Resources & Files</TabsTrigger>
                                    <TabsTrigger value="members" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-teal-700">Members Directory</TabsTrigger>
                                </TabsList>
                                
                                <div className="mt-6">
                                    <TabsContent value="feed" className="space-y-6 m-0">
                                         {/* Create Post */}
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex gap-4">
                                                <Avatar>
                                                    <AvatarImage src="https://github.com/shadcn.png" />
                                                    <AvatarFallback>SC</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <Input 
                                                        className="bg-slate-50 border-slate-200 mb-3" 
                                                        placeholder={`Share something with ${selectedCommunity.name}...`} 
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><ImageIcon size={18}/></Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><Smile size={18}/></Button>
                                                        </div>
                                                        <Button size="sm" className="h-8 bg-slate-900 text-white">Post</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {detailPosts.length > 0 ? detailPosts.map(post => (
                                            <div key={post.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                <div className="p-4 flex items-start justify-between">
                                                    <div className="flex gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={post.authorAvatar} />
                                                            <AvatarFallback>{post.author[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-900">{post.author}</div>
                                                            <div className="text-xs text-slate-500">{post.authorRole} • {post.time}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-4 pb-3">
                                                    <p className="text-sm text-slate-800 leading-relaxed">{post.content}</p>
                                                </div>
                                                {post.image && (
                                                    <div className="relative aspect-video w-full bg-slate-100">
                                                        <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                                                    <Button variant="ghost" size="sm" className="h-8 text-slate-500 gap-2 hover:text-rose-600"><Heart size={16}/> {post.likes}</Button>
                                                    <Button variant="ghost" size="sm" className="h-8 text-slate-500 gap-2"><MessageSquare size={16}/> {post.comments}</Button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                    <MessageSquare size={24} />
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-900">No discussions yet</h3>
                                                <p className="text-xs text-slate-500 mt-1">Be the first to start a conversation!</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    
                                    <TabsContent value="resources">
                                         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-slate-900">Community Guidelines v2.0.pdf</h4>
                                                        <p className="text-xs text-slate-500">Shared by Admin • 2.4 MB</p>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="text-slate-400"><Download size={16}/></Button>
                                                </div>
                                            ))}
                                         </div>
                                    </TabsContent>

                                    <TabsContent value="members">
                                         <div className="grid grid-cols-2 gap-4">
                                            {[1,2,3,4,5,6].map(i => (
                                                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedCommunity.id}${i}`} />
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">Community Member {i}</div>
                                                        <div className="text-xs text-slate-500">Department Name</div>
                                                    </div>
                                                </div>
                                            ))}
                                         </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                        
                        <div className="space-y-6">
                            
                            {/* Community Admins */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Shield size={16} className="text-indigo-600"/> Community Leads</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8"><AvatarFallback>AD</AvatarFallback></Avatar>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-900">Admin Name</div>
                                            <div className="text-xs text-slate-500">Creator</div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6"><MessageSquare size={14}/></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden">
            
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Communities</h2>
                    <p className="text-xs text-slate-500">Connect, share, and grow with your colleagues</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={() => setCreateOpen(true)}>
                        <Plus size={16} /> Create Community
                    </Button>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 w-full overflow-y-auto min-h-0">
                <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-md">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">My Groups</p>
                                    <div className="text-3xl font-bold mt-1">{myGroups.length}</div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Users size={20} />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Active</p>
                                    <div className="text-3xl font-bold text-slate-900 mt-1">1,240</div>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <Target size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <Card className="border-slate-200 shadow-sm min-h-[500px] flex flex-col">
                        <CardHeader className="border-b border-slate-100 py-3 px-6">
                            <div className="flex items-center justify-between">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                                    <TabsList>
                                        <TabsTrigger value="feed" className="gap-2">
                                            <MessageSquare size={14} /> My Feed
                                        </TabsTrigger>
                                        <TabsTrigger value="discover" className="gap-2">
                                            <Search size={14} /> Discover Groups
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <div className="relative w-64">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <Input 
                                        placeholder="Search topics, groups..." 
                                        className="pl-9 h-9 bg-slate-50 border-slate-200" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        
                        <div className="flex-1 bg-slate-50/30 p-6">
                            
                            {/* Feed Tab */}
                            {activeTab === 'feed' && (
                                <div className="max-w-2xl mx-auto space-y-6">
                                    {/* Create Post Widget */}
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex gap-4">
                                            <Avatar>
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>SC</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <Input 
                                                    className="bg-slate-50 border-slate-200 mb-3" 
                                                    placeholder="Share something with your communities..." 
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                            <ImageIcon size={18} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                            <Smile size={18} />
                                                        </Button>
                                                    </div>
                                                    <Button size="sm" className="h-8 bg-slate-900 text-white">Post</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feed Items */}
                                    {FEED_POSTS.map(post => (
                                        <div key={post.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
                                            <div className="p-4 flex items-start justify-between">
                                                <div className="flex gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={post.authorAvatar} />
                                                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-900">{post.author}</div>
                                                        <div className="text-xs text-slate-500">{post.authorRole} • {post.time}</div>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal cursor-pointer hover:bg-slate-200" onClick={() => handleSelectCommunity(post.communityId)}>
                                                    {post.communityName}
                                                </Badge>
                                            </div>
                                            
                                            <div className="px-4 pb-3">
                                                <p className="text-sm text-slate-800 leading-relaxed">{post.content}</p>
                                            </div>

                                            {post.image && (
                                                <div className="relative aspect-video w-full bg-slate-100">
                                                    <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                                                <Button variant="ghost" size="sm" className="h-8 text-slate-500 gap-2 hover:text-rose-600">
                                                    <Heart size={16} /> {post.likes}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 text-slate-500 gap-2">
                                                    <MessageSquare size={16} /> {post.comments}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 text-slate-500 gap-2 ml-auto">
                                                    <Share2 size={16} /> Share
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Discover Tab */}
                            {activeTab === 'discover' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {COMMUNITIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(community => (
                                        <div key={community.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-teal-300 transition-colors group cursor-pointer" onClick={() => handleSelectCommunity(community.id)}>
                                            <div className="h-24 bg-slate-100 relative">
                                                <img src={community.cover} alt={community.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                                <div className={cn("absolute -bottom-6 left-4 p-2 rounded-xl shadow-sm bg-white", community.color)}>
                                                    <community.icon size={24} />
                                                </div>
                                            </div>
                                            <div className="pt-8 px-4 pb-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{community.name}</h3>
                                                        <span className="text-xs text-slate-500">{community.category} • {community.members} Members</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-4 flex-1">{community.desc}</p>
                                                <Button 
                                                    variant={community.isJoined ? "outline" : "default"} 
                                                    className={cn("w-full", !community.isJoined && "bg-teal-600 hover:bg-teal-700")}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toast.success(community.isJoined ? "Left group" : "Joined group!");
                                                    }}
                                                >
                                                    {community.isJoined ? "Joined" : "Join Community"}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </Card>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Community</DialogTitle>
                        <DialogDescription>Start a new group to connect with colleagues sharing similar interests.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Community Name</Label>
                            <Input placeholder="e.g. Hiking Club" />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional Development</SelectItem>
                                    <SelectItem value="social">Social & Fun</SelectItem>
                                    <SelectItem value="sports">Sports & Wellness</SelectItem>
                                    <SelectItem value="hobbies">Hobbies & Interests</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea placeholder="What is this community about?" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => { toast.success("Community created successfully!"); setCreateOpen(false); }}>Create Community</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};
