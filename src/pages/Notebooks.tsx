import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, LogOut, User } from 'lucide-react';
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

interface Notebook {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  sort_order: number;
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
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true });

      if (error) throw error;
      setNotebooks(data || []);
    } catch (error) {
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
        .delete()
        .eq('id', notebookToDelete.id);

      if (error) throw error;

      setNotebooks(notebooks.filter(n => n.id !== notebookToDelete.id));
      setDeleteDialogOpen(false);
      setNotebookToDelete(null);
      
      toast({
        title: "Notebook deleted",
        description: `"${notebookToDelete.title}" and all its notes have been deleted`,
      });
    } catch (error) {
      toast({
        title: "Error deleting notebook",
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
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">My Notebooks</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Notebook
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
            className="sm:hidden"
          >
            <Plus className="w-4 h-4 mr-2" />
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
                          setNotebookToDelete(notebook);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive"
                      >
                        Delete
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
            <DialogTitle>Delete Notebook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{notebookToDelete?.title}"? This will also delete all notes in this notebook. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteNotebook}>
              Delete Notebook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}