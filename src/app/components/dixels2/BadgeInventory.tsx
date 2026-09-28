import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { useVms, Badge as BadgeType } from './VmsContext';
import { Trash2, Plus, Upload, CreditCard, Search, MoreHorizontal, Eye, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';

export const BadgeInventory: React.FC = () => {
  const { badges, addBadge, deleteBadge, markBadgeLost, visitors } = useVms();
  const [newBadgeNum, setNewBadgeNum] = useState('');
  const [isImportOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, assigned, lost
  const [searchTerm, setSearchTerm] = useState('');
  
  // Details/Delete Dialog State
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleAdd = () => {
    if (!newBadgeNum.trim()) return;
    addBadge(newBadgeNum.trim());
    setNewBadgeNum('');
  };

  const handleImport = () => {
    const lines = importText.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    lines.forEach(num => addBadge(num));
    setImportOpen(false);
    setImportText('');
  };

  const getVisitorName = (visitorId?: string | number) => {
     if (!visitorId) return 'Unknown';
     const v = visitors.find(v => v.id === visitorId);
     return v ? v.name : `Visitor #${visitorId}`;
  };

  const filteredBadges = badges.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (searchTerm && !b.number.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: badges.length,
    available: badges.filter(b => b.status === 'available').length,
    assigned: badges.filter(b => b.status === 'assigned').length,
    lost: badges.filter(b => b.status === 'lost').length
  };

  const handleDelete = () => {
      if (selectedBadge) {
          deleteBadge(selectedBadge.id);
          setDeleteConfirmOpen(false);
          setDetailsOpen(false);
          setSelectedBadge(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
         <Card>
            <CardContent className="pt-6">
               <div className="text-2xl font-bold">{stats.total}</div>
               <p className="text-xs text-slate-500">Total Cards</p>
            </CardContent>
         </Card>
         <Card>
            <CardContent className="pt-6">
               <div className="text-2xl font-bold text-green-600">{stats.available}</div>
               <p className="text-xs text-slate-500">Available</p>
            </CardContent>
         </Card>
         <Card>
            <CardContent className="pt-6">
               <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
               <p className="text-xs text-slate-500">In Use</p>
            </CardContent>
         </Card>
         <Card>
            <CardContent className="pt-6">
               <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
               <p className="text-xs text-slate-500">Lost/Damaged</p>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Badge Inventory</CardTitle>
              <CardDescription>Manage physical access cards and badges</CardDescription>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" onClick={() => setImportOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Bulk Import
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
             <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input 
                   placeholder="Search badge number..." 
                   className="pl-9"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex gap-2">
                <Input 
                   placeholder="New Badge #" 
                   className="w-[150px]" 
                   value={newBadgeNum}
                   onChange={(e) => setNewBadgeNum(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} disabled={!newBadgeNum.trim()}>
                   <Plus className="h-4 w-4" />
                </Button>
             </div>
          </div>
          
          <div className="flex gap-2 mb-4">
             {['all', 'available', 'assigned', 'lost'].map(f => (
                <Button 
                   key={f} 
                   variant={filter === f ? 'default' : 'ghost'} 
                   size="sm"
                   onClick={() => setFilter(f)}
                   className="capitalize"
                >
                   {f}
                </Button>
             ))}
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBadges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                       No badges found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBadges.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell className="font-mono font-medium">
                         <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-slate-400" />
                            {badge.number}
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                           badge.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' :
                           badge.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                           'bg-red-50 text-red-700 border-red-200'
                        }>
                           {badge.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                         {badge.assignedToVisitorId ? getVisitorName(badge.assignedToVisitorId) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                    setSelectedBadge(badge);
                                    setDetailsOpen(true);
                                }}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                {badge.status === 'assigned' && (
                                    <DropdownMenuItem onClick={() => markBadgeLost(badge.number)}>
                                        <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" /> Mark as Lost
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => {
                                        setSelectedBadge(badge);
                                        setDeleteConfirmOpen(true);
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Badge
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Import Badges</DialogTitle>
               <DialogDescription>
                  Enter badge numbers separated by commas or new lines.
               </DialogDescription>
            </DialogHeader>
            <div className="py-4">
               <Textarea 
                  placeholder="101, 102, 103..." 
                  className="min-h-[150px]"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
               />
               <p className="text-xs text-slate-500 mt-2">
                  Duplicates will be skipped automatically.
               </p>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
               <Button onClick={handleImport}>Import Badges</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Badge Details: #{selectedBadge?.number}</DialogTitle>
                  <DialogDescription>Full history and metadata for this access card.</DialogDescription>
              </DialogHeader>
              {selectedBadge && (
                  <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <Label className="text-slate-500">Status</Label>
                              <div className="font-medium capitalize mt-1">{selectedBadge.status}</div>
                          </div>
                          <div>
                              <Label className="text-slate-500">Date Added</Label>
                              <div className="font-medium mt-1">
                                  {new Date(selectedBadge.createdAt).toLocaleDateString()}
                              </div>
                          </div>
                          <div>
                              <Label className="text-slate-500">Added By</Label>
                              <div className="font-medium mt-1">{selectedBadge.createdBy}</div>
                          </div>
                          {selectedBadge.assignedToVisitorId && (
                              <div>
                                  <Label className="text-slate-500">Currently With</Label>
                                  <div className="font-medium mt-1 text-blue-600">
                                      {getVisitorName(selectedBadge.assignedToVisitorId)}
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      {selectedBadge.status === 'lost' && (
                          <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                  This badge is marked as lost and should be deactivated in the physical access control system.
                              </AlertDescription>
                          </Alert>
                      )}
                  </div>
              )}
              <DialogFooter className="gap-2 sm:justify-between">
                  {selectedBadge?.status !== 'lost' && (
                       <Button 
                        variant="ghost" 
                        className="mr-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => {
                            if (selectedBadge) {
                                markBadgeLost(selectedBadge.number);
                                setDetailsOpen(false);
                            }
                        }}
                       >
                           Mark as Lost
                       </Button>
                  )}
                  <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
                  </div>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Delete Badge?</DialogTitle>
                  <DialogDescription>
                      Are you sure you want to permanently delete Badge <strong>#{selectedBadge?.number}</strong>? 
                      This action cannot be undone.
                  </DialogDescription>
              </DialogHeader>
              <div className="bg-slate-50 p-3 rounded-md text-sm border border-slate-200">
                  <p className="font-medium">Audit Info:</p>
                  <ul className="list-disc pl-5 mt-1 text-slate-600">
                      <li>Added on {selectedBadge ? new Date(selectedBadge.createdAt).toLocaleDateString() : '-'}</li>
                      <li>Added by {selectedBadge?.createdBy || '-'}</li>
                  </ul>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDelete}>Delete Badge</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
};
