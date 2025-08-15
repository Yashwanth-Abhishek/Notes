import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, LogOut, User, BookOpen, FileText, Archive, Trash2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import GlitchText from '@/components/GlitchText';

interface Notebook {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  sort_order: number;
  is_archived?: boolean;
  is_deleted?: boolean;
  deleted_at?: string;
}

export default function Notebooks() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<Notebook | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [notebookToRename, setNotebookToRename] = useState<Notebook | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchNotebooks();
  }, [user, navigate]);

  const fetchNotebooks = async () => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('is_archived', false)
        .eq('is_deleted', false)
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      setNotebooks(data || []);
    } catch (error) {
      console.error('Error fetching notebooks:', error);
      toast({
        title: "Error fetching notebooks",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNotebook = async () => {
    if (!newNotebookTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert([{
          title: newNotebookTitle.trim(),
          user_id: user?.id,
          sort_order: notebooks.length
        }])
        .select()
        .single();

      if (error) throw error;

      setNotebooks([...notebooks, data]);
      setNewNotebookTitle('');
      setCreateDialogOpen(false);
      
      toast({
        title: "Notebook created",
        description: `"${data.title}" has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error creating notebook",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const deleteNotebook = async () => {
    if (!notebookToDelete) return;

    try {
      const { error } = await supabase
        .from('notebooks')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', notebookToDelete.id);

      if (error) throw error;

      setNotebooks(notebooks.filter(n => n.id !== notebookToDelete.id));
      setDeleteDialogOpen(false);
      setNotebookToDelete(null);
      
      toast({
        title: "Notebook moved to trash",
        description: `"${notebookToDelete.title}" has been moved to trash`,
      });
    } catch (error) {
      console.error('Error moving notebook to trash:', error);
      toast({
        title: "Error moving notebook to trash",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const renameNotebook = async () => {
    if (!notebookToRename || !newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('notebooks')
        .update({ title: newTitle.trim() })
        .eq('id', notebookToRename.id);

      if (error) throw error;

      setNotebooks(notebooks.map(n => 
        n.id === notebookToRename.id 
          ? { ...n, title: newTitle.trim() }
          : n
      ));
      setRenameDialogOpen(false);
      setNotebookToRename(null);
      setNewTitle('');
      
      toast({
        title: "Notebook renamed",
        description: `"${notebookToRename.title}" has been renamed to "${newTitle.trim()}"`,
      });
    } catch (error) {
      toast({
        title: "Error renaming notebook",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const archiveNotebook = async (notebook: Notebook) => {
    try {
      const { error } = await supabase
        .from('notebooks')
        .update({ is_archived: true })
        .eq('id', notebook.id);

      if (error) throw error;

      setNotebooks(notebooks.filter(n => n.id !== notebook.id));
      
      toast({
        title: "Notebook archived",
        description: `"${notebook.title}" has been moved to archive`,
      });
    } catch (error) {
      console.error('Error archiving notebook:', error);
      toast({
        title: "Error archiving notebook",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <BookOpen className="w-8 h-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <FileText className="w-2 h-2 text-primary-foreground" />
                </div>
              </div>
              <GlitchText
                speed={1}
                enableShadows={true}
                enableOnHover={true}
                className="text-2xl font-bold"
              >
                Notes
              </GlitchText>
            </div>
            <div className="text-muted-foreground">/</div>
            <h1 className="text-2xl font-bold">My Notebooks</h1>
          </div>
          
                     <div className="flex items-center space-x-4">
             <Button
               variant="ghost"
               size="sm"
               onClick={() => setSidebarOpen(!sidebarOpen)}
             >
               {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
             </Button>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                     <AvatarFallback>
                       <User className="h-4 w-4" />
                     </AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="w-56" align="end" forceMount>
                 <div className="flex items-center justify-start gap-2 p-2">
                   <div className="flex flex-col space-y-1 leading-none">
                     <p className="font-medium">{user?.user_metadata?.full_name}</p>
                     <p className="w-[200px] truncate text-sm text-muted-foreground">
                       {user?.email}
                     </p>
                   </div>
                 </div>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={signOut}>
                   <LogOut className="mr-2 h-4 w-4" />
                   Sign out
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
        </div>
             </header>

               {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
         <div className="flex flex-col h-full">
           {/* Sidebar Header */}
           <div className="flex items-center justify-between p-4 border-b border-border">
             <h2 className="text-lg font-semibold">Navigation</h2>
             <Button
               variant="ghost"
               size="sm"
               onClick={() => setSidebarOpen(false)}
               className="lg:hidden"
             >
               <X className="h-4 w-4" />
             </Button>
           </div>
           
           {/* Sidebar Navigation */}
           <nav className="flex-1 p-4 space-y-2">
             <Button
               variant="ghost"
               className="w-full justify-start"
               onClick={() => {
                 setSidebarOpen(false);
                 // Navigate to main notebooks view
               }}
             >
               <BookOpen className="h-4 w-4 mr-3" />
               My Notebooks
             </Button>
                            <Button
                 variant="ghost"
                 className="w-full justify-start"
                 onClick={() => {
                   setSidebarOpen(false);
                   navigate('/archive');
                 }}
               >
                 <Archive className="h-4 w-4 mr-3" />
                 Archive
               </Button>
                            <Button
                 variant="ghost"
                 className="w-full justify-start"
                 onClick={() => {
                   setSidebarOpen(false);
                   navigate('/deleted');
                 }}
               >
                 <Trash2 className="h-4 w-4 mr-3" />
                 Deleted
               </Button>
           </nav>
           
           {/* Sidebar Footer */}
           <div className="p-4 border-t border-border">
             <div className="flex items-center space-x-3">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                 <AvatarFallback>
                   <User className="h-4 w-4" />
                 </AvatarFallback>
               </Avatar>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name}</p>
                 <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
               </div>
               <Button variant="ghost" size="sm" onClick={signOut}>
                 <LogOut className="h-4 w-4" />
               </Button>
             </div>
           </div>
         </div>
       </div>

       {/* Overlay for mobile */}
       {sidebarOpen && (
         <div
           className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
           onClick={() => setSidebarOpen(false)}
         />
       )}

                      {/* Main Content */}
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : ''}`}>
         <div className="container mx-auto px-4 py-8">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search notebooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Notebook
          </Button>
        </div>

        {/* Notebooks Grid */}
        {filteredNotebooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No notebooks found' : 'No notebooks yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first notebook to get started'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Notebook
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotebooks.map((notebook) => (
              <Card
                key={notebook.id}
                className="notebook-card cursor-pointer group"
                onClick={() => navigate(`/notebooks/${notebook.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                    {notebook.title}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                                         <DropdownMenuContent align="end">
                       <DropdownMenuItem
                         onClick={(e) => {
                           e.stopPropagation();
                           setNotebookToRename(notebook);
                           setNewTitle(notebook.title);
                           setRenameDialogOpen(true);
                         }}
                       >
                         <FileText className="h-4 w-4 mr-2" />
                         Rename
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         onClick={(e) => {
                           e.stopPropagation();
                           archiveNotebook(notebook);
                         }}
                       >
                         <Archive className="h-4 w-4 mr-2" />
                         Archive
                       </DropdownMenuItem>
                       <DropdownMenuItem
                         onClick={(e) => {
                           e.stopPropagation();
                           setNotebookToDelete(notebook);
                           setDeleteDialogOpen(true);
                         }}
                         className="text-destructive"
                       >
                         <Trash2 className="h-4 w-4 mr-2" />
                         Move to Trash
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(notebook.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
                 )}
         </div>
       </main>

      {/* Create Notebook Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
            <DialogDescription>
              Give your notebook a name to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notebook Title</Label>
              <Input
                id="title"
                value={newNotebookTitle}
                onChange={(e) => setNewNotebookTitle(e.target.value)}
                placeholder="Enter notebook title..."
                onKeyDown={(e) => e.key === 'Enter' && createNotebook()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNotebook} disabled={!newNotebookTitle.trim()}>
              Create Notebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
                         <DialogTitle>Move to Trash</DialogTitle>
                         <DialogDescription>
               Are you sure you want to move "{notebookToDelete?.title}" to trash? This will also move all notes in this notebook to trash. You can restore them later.
             </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
                         <Button variant="destructive" onClick={deleteNotebook}>
               Move to Trash
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Notebook Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Notebook</DialogTitle>
            <DialogDescription>
              Enter a new name for your notebook.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-title">Notebook Title</Label>
              <Input
                id="rename-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new notebook title..."
                onKeyDown={(e) => e.key === 'Enter' && renameNotebook()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={renameNotebook} disabled={!newTitle.trim()}>
              Rename Notebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}