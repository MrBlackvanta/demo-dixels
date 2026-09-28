import React, { useState } from 'react';
import { 
  Folder, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  Search, 
  Plus, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Trash2, 
  Move, 
  Info, 
  CheckCircle2, 
  UploadCloud, 
  X,
  Filter,
  ChevronRight,
  Home,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { cn } from '../ui/utils';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

// --- Mock Data ---

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  format: string;
  size: string;
  dimensions?: string;
  folderId: string;
  url: string;
  uploadDate: Date;
  uploadedBy: string;
  tags: string[];
}

interface Folder {
  id: string;
  name: string;
  count: number;
  parentId: string | null;
}

const INITIAL_FOLDERS: Folder[] = [
  { id: 'marketing', name: 'Marketing Materials', count: 12, parentId: null },
  { id: 'events', name: 'Event Photos', count: 45, parentId: null },
  { id: 'logos', name: 'Brand Assets & Logos', count: 8, parentId: null },
  { id: 'docs', name: 'Policy Documents', count: 15, parentId: null },
  { id: 'campaign-q4', name: 'Q4 Campaign', count: 5, parentId: 'marketing' },
];

const INITIAL_ASSETS: Asset[] = [
  { 
    id: 'a1', name: 'Office_Exterior_Day.jpg', type: 'image', format: 'JPG', size: '2.4 MB', dimensions: '1920x1080', 
    folderId: 'marketing', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', 
    uploadDate: new Date(2024, 9, 15), uploadedBy: 'Sarah Chen', tags: ['office', 'exterior', 'hq'] 
  },
  { 
    id: 'a2', name: 'Team_Meeting_Collaborative.jpg', type: 'image', format: 'JPG', size: '1.8 MB', dimensions: '2400x1600', 
    folderId: 'marketing', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', 
    uploadDate: new Date(2024, 9, 12), uploadedBy: 'Mike Ross', tags: ['team', 'meeting', 'people'] 
  },
  { 
    id: 'a3', name: 'Annual_Report_2023.pdf', type: 'document', format: 'PDF', size: '15.2 MB', 
    folderId: 'docs', url: '', 
    uploadDate: new Date(2024, 8, 20), uploadedBy: 'Finance Team', tags: ['report', 'finance', '2023'] 
  },
  { 
    id: 'a4', name: 'Town_Hall_Recording_Oct.mp4', type: 'video', format: 'MP4', size: '450 MB', dimensions: '1920x1080', 
    folderId: 'events', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', // Using image as placeholder for video thumb
    uploadDate: new Date(2024, 9, 28), uploadedBy: 'Comms', tags: ['townhall', 'october', 'video'] 
  },
  { 
    id: 'a5', name: 'Logo_Primary_Blue.png', type: 'image', format: 'PNG', size: '240 KB', dimensions: '500x500', 
    folderId: 'logos', url: 'https://images.unsplash.com/photo-1629904853716-6c29f4624304?w=400&q=80', 
    uploadDate: new Date(2024, 0, 15), uploadedBy: 'Design Team', tags: ['logo', 'brand', 'transparent'] 
  },
  { 
    id: 'a6', name: 'Q4_Strategy_Deck.pdf', type: 'document', format: 'PDF', size: '5.1 MB', 
    folderId: 'marketing', url: '', 
    uploadDate: new Date(2024, 9, 1), uploadedBy: 'Sarah Chen', tags: ['strategy', 'q4', 'deck'] 
  },
  { 
    id: 'a7', name: 'Lobby_Screen_Promo.jpg', type: 'image', format: 'JPG', size: '3.2 MB', dimensions: '3840x2160', 
    folderId: 'marketing', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', 
    uploadDate: new Date(2024, 9, 30), uploadedBy: 'Facilities', tags: ['screen', 'promo', 'lobby'] 
  },
];

export const DigitalAssetsView: React.FC = () => {
  // State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // null = root/all
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Data State
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);

  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Derived
  const currentFolder = folders.find(f => f.id === currentFolderId);
  
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // If searching, show matches from all folders. If browsing, filter by folder.
    if (searchQuery) return matchesSearch;
    
    // Root view shows items with no folder (if any) or recently added? 
    // Usually DAMs show a dashboard at root or just the folders. 
    // Let's make "All Assets" view if currentFolderId is null, OR show only folders.
    // For simplicity: If root, show everything or specific logic.
    // Let's go with: Root = "All Assets" view for now, or use a specific "All" folder logic.
    // Actually, typical explorer logic:
    if (currentFolderId) return asset.folderId === currentFolderId && matchesSearch;
    return matchesSearch; // Show all if at root
  });

  const displayedFolders = folders.filter(f => {
    if (searchQuery) return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (currentFolderId) return f.parentId === currentFolderId;
    return f.parentId === null;
  });

  // Actions
  const handleUploadSimulate = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 10;
        });
    }, 200);

    setTimeout(() => {
        const newAsset: Asset = {
            id: `a${Date.now()}`,
            name: `Upload_${Date.now()}.jpg`,
            type: 'image',
            format: 'JPG',
            size: '1.5 MB',
            dimensions: '1920x1080',
            folderId: currentFolderId || 'marketing',
            url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
            uploadDate: new Date(),
            uploadedBy: 'Admin',
            tags: ['new', 'upload']
        };
        setAssets([newAsset, ...assets]);
        setIsUploadOpen(false);
        toast.success("File uploaded successfully");
    }, 2500);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);
    toast.success("Asset moved to trash");
  };

  const handleCreateFolder = () => {
     const name = prompt("Enter folder name:");
     if (name) {
         const newFolder: Folder = {
             id: name.toLowerCase().replace(/\s+/g, '-'),
             name,
             count: 0,
             parentId: currentFolderId
         };
         setFolders([...folders, newFolder]);
         toast.success("Folder created");
     }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Digital Assets</h1>
                    <p className="text-xs text-slate-500">Central repository for all media and documents</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <Input 
                        placeholder="Search assets..." 
                        className="pl-9 h-9" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="icon" onClick={() => setViewMode('grid')} className={cn(viewMode === 'grid' && "bg-slate-100")}>
                    <Grid size={16} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setViewMode('list')} className={cn(viewMode === 'list' && "bg-slate-100")}>
                    <List size={16} />
                </Button>
                <Button className="bg-slate-900 text-white gap-2" onClick={() => setIsUploadOpen(true)}>
                    <UploadCloud size={16} /> Upload
                </Button>
            </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setCurrentFolderId(null)}>
                        <Home size={16} /> All Assets
                    </Button>
                </div>
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold px-2 mb-2 block">Folders</Label>
                        {folders.filter(f => f.parentId === null).map(folder => (
                            <div key={folder.id}>
                                <button
                                    onClick={() => setCurrentFolderId(folder.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group",
                                        currentFolderId === folder.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Folder size={16} className={cn(currentFolderId === folder.id ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600")} />
                                        <span className="truncate">{folder.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{folder.count}</span>
                                </button>
                                {/* Nested Folders (1 level deep for mock) */}
                                {folders.filter(sub => sub.parentId === folder.id).map(sub => (
                                     <button
                                        key={sub.id}
                                        onClick={() => setCurrentFolderId(sub.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between pl-8 pr-3 py-2 rounded-md text-sm transition-colors group",
                                            currentFolderId === sub.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="truncate">{sub.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t border-slate-200">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-500" onClick={handleCreateFolder}>
                        <Plus size={14} /> New Folder
                    </Button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Breadcrumb / Toolbar */}
                <div className="h-12 border-b border-slate-200 bg-slate-50/50 flex items-center px-4 gap-2 text-sm text-slate-600">
                    <button onClick={() => setCurrentFolderId(null)} className="hover:text-slate-900">Assets</button>
                    {currentFolder && (
                        <>
                            <ChevronRight size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-900">{currentFolder.name}</span>
                        </>
                    )}
                    <div className="flex-1" />
                    <span className="text-xs text-slate-400">{filteredAssets.length} items</span>
                </div>

                <ScrollArea className="flex-1 p-6">
                    {filteredAssets.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} />
                            </div>
                            <p>No assets found in this folder</p>
                        </div>
                    )}

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredAssets.map(asset => (
                                <div 
                                    key={asset.id} 
                                    className={cn(
                                        "group relative bg-white border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md",
                                        selectedAsset?.id === asset.id ? "ring-2 ring-indigo-500 border-transparent shadow-md" : "border-slate-200"
                                    )}
                                    onClick={() => setSelectedAsset(asset)}
                                >
                                    <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                        {asset.type === 'image' ? (
                                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                        ) : asset.type === 'video' ? (
                                            <>
                                                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white">
                                                        <Film size={20} />
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <FileText size={48} className="text-slate-300" />
                                        )}
                                        
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                                <Download size={14} />
                                            </Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); }}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="font-medium text-sm text-slate-900 truncate" title={asset.name}>{asset.name}</div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-slate-500">{asset.format} • {asset.size}</span>
                                            {selectedAsset?.id === asset.id && <CheckCircle2 size={14} className="text-indigo-500" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Size</th>
                                        <th className="px-4 py-3 font-medium">Date Uploaded</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAssets.map(asset => (
                                        <tr 
                                            key={asset.id} 
                                            className={cn("hover:bg-slate-50 cursor-pointer", selectedAsset?.id === asset.id && "bg-indigo-50 hover:bg-indigo-50")}
                                            onClick={() => setSelectedAsset(asset)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                         {asset.type === 'image' || asset.type === 'video' ? (
                                                             <img src={asset.url} className="w-full h-full object-cover" />
                                                         ) : (
                                                             <FileText size={16} className="text-slate-500" />
                                                         )}
                                                    </div>
                                                    <span className="font-medium text-slate-900">{asset.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 uppercase">{asset.format}</td>
                                            <td className="px-4 py-3 text-slate-500">{asset.size}</td>
                                            <td className="px-4 py-3 text-slate-500">{format(asset.uploadDate, 'MMM d, yyyy')}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); }}>
                                                    <Trash2 size={14} className="text-slate-400 hover:text-red-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Inspector Sidebar */}
            {selectedAsset && (
                <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col h-full overflow-y-auto animate-in slide-in-from-right duration-200">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Asset Details</h3>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedAsset(null)}>
                            <X size={16} />
                        </Button>
                     </div>

                     <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-6 flex items-center justify-center">
                        {selectedAsset.type === 'image' || selectedAsset.type === 'video' ? (
                             <img src={selectedAsset.url} className="max-w-full max-h-full object-contain" />
                        ) : (
                             <FileText size={64} className="text-slate-300" />
                        )}
                     </div>

                     <div className="space-y-6">
                        <div>
                            <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Filename</Label>
                            <div className="text-sm font-medium text-slate-900 break-all mt-1">{selectedAsset.name}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Type</Label>
                                <div className="text-sm text-slate-700 mt-1 uppercase">{selectedAsset.format}</div>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Size</Label>
                                <div className="text-sm text-slate-700 mt-1">{selectedAsset.size}</div>
                            </div>
                            {selectedAsset.dimensions && (
                                <div className="col-span-2">
                                    <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Dimensions</Label>
                                    <div className="text-sm text-slate-700 mt-1">{selectedAsset.dimensions}</div>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Uploaded</Label>
                            <div className="text-sm text-slate-700 mt-1">
                                {format(selectedAsset.uploadDate, 'MMM d, yyyy')} by {selectedAsset.uploadedBy}
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 block">Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedAsset.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                        {tag}
                                    </Badge>
                                ))}
                                <Button variant="outline" size="sm" className="h-5 text-[10px] px-2 rounded-full border-dashed">
                                    <Plus size={10} className="mr-1" /> Add
                                </Button>
                            </div>
                        </div>
                     </div>

                     <div className="flex-1" />

                     <div className="grid grid-cols-2 gap-3 mt-8">
                         <Button className="w-full">
                             <Download size={16} className="mr-2" /> Download
                         </Button>
                         <Button variant="outline" className="w-full" onClick={() => toast.info("Public link copied")}>
                             Copy Link
                         </Button>
                         <Button variant="ghost" className="col-span-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteAsset(selectedAsset.id)}>
                             Delete Asset
                         </Button>
                     </div>
                </div>
            )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Assets</DialogTitle>
                    <DialogDescription>Drag and drop files here or click to browse.</DialogDescription>
                </DialogHeader>
                
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleUploadSimulate}>
                     <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                         <UploadCloud size={24} />
                     </div>
                     <p className="font-medium text-slate-900">Click to upload files</p>
                     <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>

                {uploadProgress > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                             <span>Uploading...</span>
                             <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
};
