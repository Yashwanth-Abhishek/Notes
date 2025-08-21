import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, LogOut, User, BookOpen, FileText, Archive, Trash2, Menu, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import GlitchText from '@/components/GlitchText';

type Notebook = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  sort_order: number | null;
  user_id: string;
  is_archived: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
}

export default function ArchivePage() {
  console.log('ArchivePage component rendering');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<Notebook | null>(null);

  useEffect(() => {
    console.log('Archive page useEffect - user:', user);
    if (!user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
      return;
    }
    console.log('User found, fetching archived notebooks');
    fetchArchivedNotebooks();
  }, [user, navigate]);

  const fetchArchivedNotebooks = async () => {
    console.log('fetchArchivedNotebooks called');
    try {
      setLoading(true); // Ensure loading is set to true when fetching
      console.log('Fetching archived notebooks from Supabase...');
      
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('is_archived', true)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Archived notebooks fetched:', data);
      setNotebooks(data || []);
      
      if (!data || data.length === 0) {
        console.log('No archived notebooks found');
      }
    } catch (error) {
      console.error('Error fetching archived notebooks:', error);
      toast({
        title: "Error fetching archived notebooks",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreNotebook = async (notebook: Notebook) => {
    try {
      const { error } = await supabase
        .from('notebooks')
        .update({ is_archived: false })
        .eq('id', notebook.id);

      if (error) throw error;

      setNotebooks(notebooks.filter(n => n.id !== notebook.id));
      
      toast({
        title: "Notebook restored",
        description: `"${notebook.title}" has been restored to My Notebooks`,
      });
    } catch (error) {
      toast({
        title: "Error restoring notebook",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const permanentDeleteNotebook = async () => {
    if (!notebookToDelete) return;

    try {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', notebookToDelete.id);

      if (error) throw error;

      setNotebooks(notebooks.filter(n => n.id !== notebookToDelete.id));
      setPermanentDeleteDialogOpen(false);
      setNotebookToDelete(null);
      
      toast({
        title: "Notebook permanently deleted",
        description: `"${notebookToDelete.title}" has been permanently deleted`,
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
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="relative">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Archive className="w-2 h-2 text-primary-foreground" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold ml-4">Loading Archive...</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-3 bg-primary/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log('Archive page rendering main content');
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
            <h1 className="text-2xl font-bold">Archive</h1>
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
                navigate('/notebooks');
              }}
            >
              <BookOpen className="h-4 w-4 mr-3" />
              My Notebooks
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start bg-muted"
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
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search archived notebooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Archived Notebooks Grid */}
          {filteredNotebooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Archive className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No archived notebooks found' : 'No archived notebooks'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Archived notebooks will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredNotebooks.map((notebook) => (
                <Card
                  key={notebook.id}
                  className="notebook-card group"
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
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => restoreNotebook(notebook)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setNotebookToDelete(notebook);
                            setPermanentDeleteDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Archived {new Date(notebook.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permanently</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{notebookToDelete?.title}"? This action cannot be undone and all notes in this notebook will be lost forever.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={permanentDeleteNotebook}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
